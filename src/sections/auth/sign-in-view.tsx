import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';
import { API_BASE_URL, API_ROUTES } from 'src/config-global';
import axios from 'axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(() => {
    setError(null);
    setLoading(true);
    axios.post(`${API_BASE_URL}${API_ROUTES.LOGIN}`, {
      phone: phone.replace(/\D/g, ''),
      password,
    }, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        const data = res.data as { token?: string };
        if (data && data.token) {
          localStorage.setItem('authToken', data.token);
          router.push('/');
        } else {
          setError('Ошибка авторизации');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.detail || 'Неверный номер или пароль');
        setLoading(false);
        console.log(err)
      });
  }, [phone, password, router]);

  return (
    <Box
      sx={{
        maxWidth: 360,
        mx: 'auto',
        mt: 10,
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3 }}>
        Вход в систему
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        name="phone"
        label="Номер телефона"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+996 555 123 456"
        sx={{ mb: 3 }}
        inputProps={{ inputMode: 'tel' }}
        disabled={loading}
      />
      <TextField
        fullWidth
        name="password"
        label="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        disabled={loading}
      />
      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading || !phone || !password}
      >
        {loading ? 'Входим...' : 'Войти'}
      </Button>
    </Box>
  );
}
