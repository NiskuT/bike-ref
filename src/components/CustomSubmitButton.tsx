import React from 'react'
import { Button, CircularProgress } from '@mui/material'

interface CustomSubmitButtonProps {
  loading: boolean
  label?: string
}

export const CustomSubmitButton: React.FC<CustomSubmitButtonProps> = ({
  loading,
  label = 'Submit',
}) => (
  <Button
    type="submit"
    variant="contained"
    fullWidth
    disabled={loading}
    startIcon={loading ? <CircularProgress size={20} /> : null}
  >
    {label}
  </Button>
) 
