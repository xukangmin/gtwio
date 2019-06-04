import { RootLayout } from '../Root/RootLayout';
import { LoginMain } from '../UserManagement/LoginMain';

import { Home } from '../Pages/Home';
import { Settings } from '../Pages/Settings';
import { Dashboard } from '../Pages/Asset/Dashboard';
import { TempGauge } from '../Pages/Asset/TempGauge';
import { Data } from '../Pages/Asset/Data';
import { Configurations } from '../Pages/Asset/Configurations';
import { Configurationsb } from '../Pages/Asset/Configurationsb';

import { Device } from '../Pages/Asset/Device/Device';
import { Parameter } from '../Pages/Asset/Parameter/Parameter';
import { Tag } from '../Pages/Asset/Tag/Tag';

import NotFound from '../Pages/Error/notfound';

const routes = [
  { path: '/login',
    component: LoginMain
  },
  {
    path: '/activate*',
    component: LoginMain
  },
  {
    path: '/forgotpassword',
    component: LoginMain
  },
  {
    path: '/reset-password*',
    component: LoginMain
  },
  { component: RootLayout,
    routes: [
      { path: '/',
        exact: true,
        component: Home
      },
        {
          path: '/settings',
          exact: true,
          component: Settings
        },
        {
          path: '/asset/:assetID/dashboard',
          component: Dashboard
        },
        {
          path: '/asset/:assetID/gauge',
          component: TempGauge
        },
        {
          path: '/asset/:assetID/data',
          component: Data
        },
        {
          path: '/asset/:assetID/configurations',
          component: Configurations
        },
        {
          path: '/asset/:assetID/configurationsb',
          component: Configurationsb
        },
        {
          path: '/asset/:assetID/device/:deviceID',
          component: Device
        },
        {
          path: '/asset/:assetID/parameter/:parameterID',
          component: Parameter
        },
        {
          path: '/asset/:assetID/tag/:tagID',
          component: Tag
        },
      {
        path: '*',
        component: NotFound
      }
    ]
  }
];

export default routes;
