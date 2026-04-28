import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  alpha,
  Box,
  Divider,
  Drawer,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';
import Logo from 'src/components/LogoSign';
import { isWhiteLabeled } from '../../../config';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.sidebar.textColor};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 61px;
`
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background: `linear-gradient(180deg, ${alpha(
            theme.sidebar.background,
            0.98
          )} 0%, ${alpha(theme.sidebar.background, 0.94)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${theme.sidebar.dividerBg}`,
          boxShadow: theme.sidebar.boxShadow
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row'
              }}
            >
              <Box>
                <Logo />
                {!isWhiteLabeled && (
                  <Typography
                    sx={{
                      cursor: 'pointer',
                      mt: 1.5,
                      display: 'block',
                      textAlign: 'center',
                      color: theme.sidebar.textColor,
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      opacity: 0.9
                    }}
                    fontSize={13}
                    onClick={() => {
                      window.open('https://www.intel-loop.com/', '_blank');
                    }}
                  >
                    Traffic Signal Care
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Divider
            sx={{
              mt: theme.spacing(1),
              mx: theme.spacing(2),
              background: theme.sidebar.dividerBg
            }}
          />
          <SidebarMenu />
        </Scrollbar>
        <Divider
          sx={{
            background: theme.sidebar.dividerBg
          }}
        />
        <SidebarFooter />
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background: `linear-gradient(180deg, ${alpha(
              theme.sidebar.background,
              0.99
            )} 0%, ${alpha(theme.sidebar.background, 0.96)} 100%)`,
            borderRight: `1px solid ${theme.sidebar.dividerBg}`
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'row'
                }}
              >
                <Box>
                  <Logo />
                  {!isWhiteLabeled && (
                    <Typography
                      sx={{
                        cursor: 'pointer',
                        mt: 1.5,
                        display: 'block',
                        textAlign: 'center',
                        color: theme.sidebar.textColor,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        opacity: 0.9
                      }}
                      fontSize={13}
                      onClick={() => {
                        window.open('https://www.intel-loop.com/', '_blank');
                      }}
                    >
                      Traffic Signal Care
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(1),
                mx: theme.spacing(2),
                background: theme.sidebar.dividerBg
              }}
            />
            <SidebarMenu />
          </Scrollbar>
          <SidebarFooter />
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
