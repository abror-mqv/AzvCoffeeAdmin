import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function WorkspacesPopover() {
  // Статичные данные для отображения
  const name = 'AZV Coffee';
  const logo = '/public/assets/icons/workspaces/logo-1.webp';

  const renderAvatar = (alt: string, src: string) => (
    <Box component="img" alt={alt} src={src} sx={{ width: 24, height: 24, borderRadius: '50%' }} />
  );

  const renderLabel = (plan: string) => (
    <Label color={plan === 'Free' ? 'default' : 'info'}>{plan}</Label>
  );

  return (
    <ButtonBase
      disableRipple
      sx={{
        pl: 2,
        py: 3,
        gap: 1.5,
        pr: 1.5,
        width: 1,
        borderRadius: 1.5,
        textAlign: 'left',
        justifyContent: 'flex-start',
        bgcolor: (theme) => theme.vars ? theme.vars.palette.grey['500Channel'] : 'rgba(145,158,171,0.08)',
      }}
    >
      {renderAvatar(name, logo)}
      <Box
        sx={{
          gap: 1,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          typography: 'body2',
          fontWeight: 'fontWeightSemiBold',
        }}
      >
        {name}
      </Box>
     
    </ButtonBase>
  );
}
