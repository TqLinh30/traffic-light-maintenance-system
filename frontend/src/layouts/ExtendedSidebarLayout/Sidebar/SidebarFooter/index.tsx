import {
  alpha,
  Box,
  IconButton,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EventTwoToneIcon from '@mui/icons-material/EventTwoTone';
import PowerSettingsNewTwoToneIcon from '@mui/icons-material/PowerSettingsNewTwoTone';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import UpgradeTwoToneIcon from '@mui/icons-material/UpgradeTwoTone';
import QuestionMarkTwoToneIcon from '@mui/icons-material/QuestionMarkTwoTone';
import { isCloudVersion } from '../../../../config';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.colors.alpha.trueWhite[100],
    color: theme.palette.getContrastText(theme.colors.alpha.trueWhite[100]),
    boxShadow: theme.shadows[24],
    fontWeight: 'bold',
    fontSize: theme.typography.pxToRem(12)
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.alpha.trueWhite[100]
  }
}));

function SidebarFooter() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        height: 60
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {user.ownsCompany && (
        <LightTooltip placement="top" arrow title={t('upgrade_now')}>
          <IconButton
            sx={{
              background: theme.sidebar.menuItemBg,
              color: theme.sidebar.menuItemColor,
              border: `1px solid ${theme.sidebar.dividerBg}`,
              boxShadow: `0 8px 22px ${alpha(
                theme.colors.alpha.black[100],
                0.05
              )}`,
              transition: `${theme.transitions.create(['all'])}`,

              '&:hover': {
                background: theme.sidebar.menuItemBgActive,
                color: theme.sidebar.menuItemColorActive,
                borderColor: alpha(theme.sidebar.menuItemColorActive, 0.16)
              }
            }}
            component={isCloudVersion ? RouterLink : 'a'}
            {...(isCloudVersion
              ? { to: '/app/subscription/plans' }
              : {
                  href: 'https://atlas-cmms.com/pricing?type=selfhosted',
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })}
          >
            <UpgradeTwoToneIcon fontSize="small" />
          </IconButton>
        </LightTooltip>
      )}
      <LightTooltip placement="top" arrow title={t('documentation')}>
        <IconButton
          sx={{
            background: theme.sidebar.menuItemBg,
            color: theme.sidebar.menuItemColor,
            border: `1px solid ${theme.sidebar.dividerBg}`,
            boxShadow: `0 8px 22px ${alpha(
              theme.colors.alpha.black[100],
              0.05
            )}`,
            transition: `${theme.transitions.create(['all'])}`,

            '&:hover': {
              background: theme.sidebar.menuItemBgActive,
              color: theme.sidebar.menuItemColorActive,
              borderColor: alpha(theme.sidebar.menuItemColorActive, 0.16)
            }
          }}
          onClick={() => window.open('https://grashjs.github.io/user-guide')}
        >
          <QuestionMarkTwoToneIcon fontSize="small" />
        </IconButton>
      </LightTooltip>
      {user.superAccountRelations.length === 0 && (
        <LightTooltip placement="top" arrow title={t('wo_calendar')}>
          <IconButton
            sx={{
              background: theme.sidebar.menuItemBg,
              color: theme.sidebar.menuItemColor,
              border: `1px solid ${theme.sidebar.dividerBg}`,
              boxShadow: `0 8px 22px ${alpha(
                theme.colors.alpha.black[100],
                0.05
              )}`,
              transition: `${theme.transitions.create(['all'])}`,

              '&:hover': {
                background: theme.sidebar.menuItemBgActive,
                color: theme.sidebar.menuItemColorActive,
                borderColor: alpha(theme.sidebar.menuItemColorActive, 0.16)
              }
            }}
            to="/app/work-orders?view=calendar"
            component={RouterLink}
          >
            <EventTwoToneIcon fontSize="small" />
          </IconButton>
        </LightTooltip>
      )}
      <LightTooltip placement="top" arrow title={t('Logout')}>
        <IconButton
          sx={{
            background: theme.sidebar.menuItemBg,
            color: theme.sidebar.menuItemColor,
            border: `1px solid ${theme.sidebar.dividerBg}`,
            boxShadow: `0 8px 22px ${alpha(
              theme.colors.alpha.black[100],
              0.05
            )}`,
            transition: `${theme.transitions.create(['all'])}`,

            '&:hover': {
              background: theme.sidebar.menuItemBgActive,
              color: theme.sidebar.menuItemColorActive,
              borderColor: alpha(theme.sidebar.menuItemColorActive, 0.16)
            }
          }}
          onClick={handleLogout}
        >
          <PowerSettingsNewTwoToneIcon fontSize="small" />
        </IconButton>
      </LightTooltip>
    </Box>
  );
}

export default SidebarFooter;
