import React from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Language as LanguageIcon } from '@mui/icons-material'
import { useTranslation } from '../contexts/TranslationContext'

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as any)
    handleClose()
  }

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'en': return '🇺🇸'
      case 'fr': return '🇫🇷'
      default: return '🌐'
    }
  }

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'en': return 'English'
      case 'fr': return 'Français'
      default: return lang.toUpperCase()
    }
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          ml: 1,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {availableLanguages.map((lang) => (
          <MenuItem 
            key={lang} 
            onClick={() => handleLanguageSelect(lang)}
            selected={lang === language}
          >
            <ListItemIcon sx={{ minWidth: '32px' }}>
              <span style={{ fontSize: '1.2rem' }}>{getLanguageFlag(lang)}</span>
            </ListItemIcon>
            <ListItemText>{getLanguageName(lang)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSelector 
