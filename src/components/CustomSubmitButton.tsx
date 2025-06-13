import React from 'react'
import { Button, CircularProgress } from '@mui/material'

interface CustomSubmitButtonProps {
  loading: boolean
  disabled?: boolean
  label?: string
}

export const CustomSubmitButton: React.FC<CustomSubmitButtonProps> = ({
  loading,
  disabled = false,
  label = 'Submit',
}) => (
  <Button
    type="submit"
    variant="contained"
    sx={{ mt: 1 }}
    fullWidth
    disabled={loading || disabled}
    startIcon={loading ? <CircularProgress size={20} /> : null}
  >
    {label}
  </Button>
) 
