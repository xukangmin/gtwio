import { RootLayout } from '../Root/RootLayout'
import { HomePage } from '../HomePage/HomePage'
import { LoginMain } from '../UserManagement/LoginMain'
import NotFound from '../ErrorPage/notfound'
import { AssetMain } from '../AssetPage/AssetMain'
import { AssetOverview } from '../AssetPage/AssetOverview'
import { AssetDashboard } from '../AssetPage/AssetDashboard'
import { AssetData } from '../AssetPage/AssetData'
import { AssetDevice } from '../AssetPage/AssetDevice'
import { AssetConfigurations } from '../AssetPage/AssetConfigurations'
import { AssetDeviceDetail } from '../AssetPage/AssetDeviceDetail'
import { AssetParameterDetail } from '../AssetPage/AssetParameterDetail'
import { AssetReport } from '../AssetPage/AssetReport'
import { AssetAlert } from '../AssetPage/AssetAlert'
import { HxStatic } from '../AssetPage/dashboard_parts/widget_parts/HxStatic'
import { HxTag } from '../AssetPage/dashboard_parts/widget_parts/HxTag'

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
        component: HomePage
      },
        {
          path: '/asset/:assetID/overview',
          component: AssetOverview
        },
        {
          path: '/asset/:assetID/dashboard',
          component: HxStatic
        },
        {
          path: '/asset/:assetID/data',
          component: AssetData
        },
        {
          path: '/asset/:assetID/devices',
          component: AssetDevice
        },
        {
          path: '/asset/:assetID/configurations',
          component: AssetConfigurations
        },
        {
          path: '/asset/:assetID/device/:deviceID',
          component: AssetDeviceDetail
        },
        {
          path: '/asset/:assetID/parameter/:parameterID',
          component: AssetParameterDetail
        },
        {
          path: '/asset/:assetID/tag/:tagID',
          component: HxTag
        },
        {
          path: '/asset/:assetID/report',
          component: AssetReport
        },
        {
          path: '/asset/:assetID/alert',
          component: AssetAlert
        },
      {
        path: '*',
        component: NotFound
      }
    ]
  }
];

export default routes;
