import { RootLayout } from '../Root/RootLayout';
import { LoginMain } from '../UserManagement/LoginMain';

import { Overview } from '../Pages/Overview';
import { Dashboard } from '../Pages/Asset/Dashboard';
import { Data } from '../Pages/Asset/Data';
import { Configurations } from '../Pages/Asset/Configurations';

import { Device } from '../Pages/Asset/Device/Device';
import { Parameter } from '../Pages/Asset/Parameter/Parameter';
import { Tag } from '../Pages/Asset/Tag/Tag';

import NotFound from '../Pages/Error/notfound'

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
        component: Overview
      },
        {
          path: '/asset/:assetID/dashboard',
          component: Dashboard
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
