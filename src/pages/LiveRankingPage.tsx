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
  Divider,
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
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'
import { useConnectionMonitor } from '../hooks/useConnectionMonitor'

const LiveRankingPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { canAccessCompetition } = useAuth()
  const { t } = useTranslation()
  const { shouldRefreshData, isOnline } = useConnectionMonitor()

  const competitionIdNum = Number(competitionId)
  const canViewCompetition = canAccessCompetition(competitionIdNum, 'referee')

  const [menRankingData, setMenRankingData] = useState<LiveRankingResponse | null>(null)
  const [womenRankingData, setWomenRankingData] = useState<LiveRankingResponse | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
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
    if (selectedCategory && !loading) {
      fetchRankings()
    }
  }, [selectedCategory, page])

  // Auto-refresh data when connection is restored
  useEffect(() => {
    if (shouldRefreshData && selectedCategory && !loading) {
      console.log('Connection restored, refreshing rankings data')
      fetchRankings(true) // Use refresh mode
    }
  }, [shouldRefreshData, selectedCategory, loading])

  const fetchRankings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Fetch both men's and women's rankings
      const [menData, womenData] = await Promise.all([
        liveRankingService.getLiveRanking({
          competitionId: competitionIdNum,
          page,
          page_size: pageSize,
          category: selectedCategory,
          gender: 'H',
        }),
        liveRankingService.getLiveRanking({
          competitionId: competitionIdNum,
          page,
          page_size: pageSize,
          category: selectedCategory,
          gender: 'F',
        }),
      ])
      
      setMenRankingData(menData)
      setWomenRankingData(womenData)
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

  const renderRankingSection = (rankingData: LiveRankingResponse | null, genderLabel: string, genderIcon?: string) => {
    if (!rankingData || rankingData.rankings.length === 0) {
      return (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {genderIcon && <span>{genderIcon}</span>}
            {genderLabel}
          </Typography>
          <Alert severity="info">
            {t('liveRanking.noRankings')} {genderLabel.toLowerCase()}.
          </Alert>
        </Box>
      )
    }

    const totalPages = Math.ceil(rankingData.total / pageSize)

    return (
      <Box sx={{ mb: 4 }}>
        {/* Gender Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {genderIcon && <span>{genderIcon}</span>}
            {genderLabel}
          </Typography>
          <Chip 
            label={`${rankingData.total} ${t('liveRanking.participantsCount')}`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Rankings Display */}
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
                        {t('liveRanking.tableHeaders.dossard')} #{entry.dossard}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${entry.total_points} ${t('liveRanking.pointsUnit')}`}
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
                    <span>{t('liveRanking.tableHeaders.time')}: {formatTime(entry.chrono_sec)}</span>
                    <span>{t('liveRanking.tableHeaders.penalty')}: {entry.penality}</span>
                    <span>{t('liveRanking.tableHeaders.runs')}: {entry.number_of_runs}</span>
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
                  <TableCell>{t('liveRanking.tableHeaders.rank')}</TableCell>
                  <TableCell>{t('liveRanking.tableHeaders.participant')}</TableCell>
                  <TableCell>{t('liveRanking.tableHeaders.dossard')}</TableCell>
                  <TableCell align="right">{t('liveRanking.tableHeaders.totalPoints')}</TableCell>
                  <TableCell align="right">{t('liveRanking.tableHeaders.time')}</TableCell>
                  <TableCell align="right">{t('liveRanking.tableHeaders.penalty')}</TableCell>
                  <TableCell align="right">{t('liveRanking.tableHeaders.runs')}</TableCell>
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

        {/* Pagination for this gender */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        )}
      </Box>
    )
  }

  if (loading && !menRankingData && !womenRankingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !menRankingData && !womenRankingData) {
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

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 3, sm: 4 }, 
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
          {t('liveRanking.title')}
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
          <InputLabel>{t('liveRanking.categoryLabel')}</InputLabel>
          <Select
            value={selectedCategory}
            label={t('liveRanking.categoryLabel')}
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

        {selectedCategory && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip 
              label={`${t('liveRanking.categoryLabel')}: ${selectedCategory}`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Connection Status */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('liveRanking.connectionLost')}
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rankings Sections */}
      {selectedCategory && (
        <>
          {/* Men's Rankings */}
          {renderRankingSection(menRankingData, t('liveRanking.genderLabels.men'), "🏃‍♂️")}
          
          {/* Divider between men and women if both have data */}
          {(menRankingData?.rankings?.length ?? 0) > 0 && (womenRankingData?.rankings?.length ?? 0) > 0 && (
            <Divider sx={{ my: 4 }} />
          )}
          
          {/* Women's Rankings */}
          {renderRankingSection(womenRankingData, t('liveRanking.genderLabels.women'), "🏃‍♀️")}
        </>
      )}

      {!selectedCategory && (
        <Alert severity="info">
          {t('liveRanking.selectCategory')}
        </Alert>
      )}
    </Container>
  )
}

export default LiveRankingPage 
