import { useState } from 'react'
import {
  Typography, Button, TextField, Divider, Link, CardContent, CardMedia, Box
} from '@mui/material'
import type {
  Theme
} from '@mui/material'
import { useNavigate } from 'react-router';
// import { Link as RouterLink } from 'react-router-dom'
import useAuth from 'src/hooks/useAuth'
import type { SxProps } from '@mui/system'
import { useFormState } from 'src/hooks/useFormState';
import ResetDialog from './ResetDialog';

type LoginFormProps = {
  sx?: SxProps<Theme>
}

function LoginForm(props: LoginFormProps) {
  const { ...rest } = props
  const { login } = useAuth()

  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  const {
    handleChange, hasError, formState, setFormState
  } = useFormState({
    schema: {
      email: {
        presence: {
          allowEmpty: false,
          message: 'is required'
        }
      },
      password: {
        presence: {
          allowEmpty: false,
          message: 'is required'
        }
      }
    },
    initialState: {
      values: {
        email: process.env.NODE_ENV !== 'production' ? 'mfauser@finitydevelopment.com' : '',
        password: process.env.NODE_ENV !== 'production' ? 'password123@' : '',
      }
    }
  })

  const toggleResetPassword = () => setOpen(!open)

  const handleSubmit = async () => {
    setMessage('')

    setFormState({
      ...formState,
      isLoading: true
    })

    const res = await login({ email: formState.values.email, password: formState.values.password })
    if (!res) { return setMessage('Invalid Username/Password') }

    return navigate('/', { replace: true })
  }

  return (
    <>
      <CardContent sx={{ p: 6 }} {...rest} onSubmit={handleSubmit}>
        <Typography gutterBottom variant="h4">
          Sign in
        </Typography>
        <Typography color="error" gutterBottom>
          {message}
        </Typography>
        <Box>
          <TextField
            sx={{ m: 1 }}
            error={hasError('email')}
            fullWidth
            helperText={hasError('email') ? formState.errors.email[0] : null}
            autoComplete="username"
            label="Email address"
            name="email"
            onChange={handleChange}
            value={formState.values.email || ''}
            variant="outlined"
          />
          <TextField
            sx={{ m: 1 }}
            error={hasError('password')}
            fullWidth
            helperText={hasError('password') ? formState.errors.password[0] : null}
            autoComplete="password"
            label="Password"
            name="password"
            onChange={handleChange}
            type="password"
            value={formState.values.password || ''}
            variant="outlined"
          />
        </Box>
        <Button
          sx={{
            mt: 2,
            width: '100%'
          }}
          onClick={handleSubmit}
          color="primary"
          disabled={!formState.isValid}
          size="large"
          type="submit"
          variant="contained"
        >
          Sign in
        </Button>
        <Divider sx={{ m: 2 }} />

        <Link
          align="left"
          color="secondary"
          // component={RouterLink}
          // to="/auth/register"
          underline="always"
          variant="subtitle2"
        >
          Don&apos;t have an account?
        </Link>
        <div>
          <Link
            onClick={toggleResetPassword}
            align="right"
            color="secondary"
            variant="subtitle2"
          >
            Forgot Password?
          </Link>
        </div>

        <ResetDialog open={open} toggleResetPassword={toggleResetPassword} />
      </CardContent>
      <CardMedia
        sx={{
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
          p: 3,
          color: 'common.white',
          display: { lg: 'block', xs: 'none' },
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}
        image="/static/images/undraw_Access_account_re_8spm.png"
        title="Cover"
      />
    </>
  );
}

export default LoginForm
