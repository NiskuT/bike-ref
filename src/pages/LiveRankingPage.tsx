import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { liveRankingService } from '../api/liveRankingService'
import { competitionService } from '../api/competitionService'
import type { LiveRankingResponse, Zone } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errorHandling'

const LiveRankingPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { canAccessCompetition } = useAuth()

  const competitionIdNum = Number(competitionId)
  const canViewCompetition = canAccessCompetition(competitionIdNum, 'referee')

  const [rankingData, setRankingData] = useState<LiveRankingResponse | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedGender, setSelectedGender] = useState<'H' | 'F'>('H')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 20

  // Get unique categories from zones
  const categories = zones.map(zone => zone.category)
    .filter((category, index, self) => self.indexOf(category) === index)
    .sort()

  useEffect(() => {
    if (!competitionId) {
      setError('Invalid competition ID')
      setLoading(false)
      return
    }

    if (!canViewCompetition) {
      setError('You do not have permission to view this competition.')
      setLoading(false)
      return
    }

    // Load zones to get categories
    competitionService
      .getZones(competitionIdNum)
      .then((response) => {
        setZones(response.zones)
        // Set first category as default if none selected
        if (!selectedCategory && response.zones.length > 0) {
          const firstCategory = response.zones[0].category
          setSelectedCategory(firstCategory)
        }
      })
      .catch((err) => {
        console.error(err)
        const apiError = getErrorMessage(err)
        setError(apiError.message)
      })
      .finally(() => setLoading(false))
  }, [competitionId, competitionIdNum, canViewCompetition, selectedCategory])

  useEffect(() => {
    if (selectedCategory && selectedGender && !loading) {
      fetchRankings()
    }
  }, [selectedCategory, selectedGender, page])

  const fetchRankings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await liveRankingService.getLiveRanking({
        competitionId: competitionIdNum,
        page,
        page_size: pageSize,
        category: selectedCategory,
        gender: selectedGender,
      })
      setRankingData(data)
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value)
    setPage(1) // Reset to first page when changing category
  }

  const handleGenderChange = (event: any) => {
    setSelectedGender(event.target.value)
    setPage(1) // Reset to first page when changing gender
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleRefresh = () => {
    fetchRankings(true)
  }

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700' // Gold
      case 2: return '#C0C0C0' // Silver
      case 3: return '#CD7F32' // Bronze
      default: return theme.palette.text.secondary
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && !rankingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !rankingData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={() => navigate(`/competitions/${competitionId}/zones`)}>
            <BackIcon />
          </IconButton>
        </Box>
      </Container>
    )
  }

  const totalPages = rankingData ? Math.ceil(rankingData.total / pageSize) : 0

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3 },
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 0 }
      }}>
        <IconButton 
          onClick={() => navigate(`/competitions/${competitionId}/zones`)} 
          sx={{ 
            mr: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 1.5 }
          }}
        >
          <BackIcon />
        </IconButton>
        <TrophyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            flexGrow: 1
          }}
        >
          Live Rankings
        </Typography>
        <IconButton 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ ml: 'auto' }}
        >
          {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={handleCategoryChange}
            size="small"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={selectedGender}
            label="Gender"
            onChange={handleGenderChange}
            size="small"
          >
            <MenuItem value="H">Men (H)</MenuItem>
            <MenuItem value="F">Women (F)</MenuItem>
          </Select>
        </FormControl>

        {rankingData && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip 
              label={`Total: ${rankingData.total} participants`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
            <Chip 
              label={`Page ${page} of ${totalPages}`} 
              color="secondary" 
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rankings Table/Cards */}
      {rankingData && rankingData.rankings.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile Card View
            <Stack spacing={2} sx={{ mb: 3 }}>
              {rankingData.rankings.map((entry) => (
                <Card key={entry.dossard} elevation={2}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mr: 2,
                        minWidth: '60px'
                      }}>
                        {entry.rank <= 3 && (
                          <TrophyIcon 
                            sx={{ 
                              color: getTrophyColor(entry.rank), 
                              mr: 0.5,
                              fontSize: '1.2rem'
                            }} 
                          />
                        )}
                        <Typography variant="h6" fontWeight="bold">
                          #{entry.rank}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {entry.first_name} {entry.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dossard #{entry.dossard} • {entry.gender === 'H' ? 'Men' : 'Women'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${entry.total_points} pts`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'text.secondary'
                    }}>
                      <span>Time: {formatTime(entry.chrono_sec)}</span>
                      <span>Penalty: {entry.penality}</span>
                      <span>Runs: {entry.number_of_runs}</span>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            // Desktop Table View
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Participant</TableCell>
                    <TableCell>Dossard</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell align="right">Total Points</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell align="right">Penalty</TableCell>
                    <TableCell align="right">Runs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingData.rankings.map((entry) => (
                    <TableRow key={entry.dossard}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {entry.rank <= 3 && (
                            <TrophyIcon 
                              sx={{ 
                                color: getTrophyColor(entry.rank), 
                                mr: 0.5,
                                fontSize: '1.2rem'
                              }} 
                            />
                          )}
                          <Typography fontWeight="bold">
                            {entry.rank}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">
                          {entry.first_name} {entry.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{entry.dossard}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.gender === 'H' ? 'Men' : 'Women'}
                          color={entry.gender === 'H' ? 'primary' : 'secondary'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={entry.total_points}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{formatTime(entry.chrono_sec)}</TableCell>
                      <TableCell align="right">{entry.penality}</TableCell>
                      <TableCell align="right">{entry.number_of_runs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">
          No rankings found for the selected category.
        </Alert>
      )}
    </Container>
  )
}

export default LiveRankingPage 
