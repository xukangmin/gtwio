import { RootLayout } from '../Root/RootLayout'
import { HomePage } from '../HomePage/HomePage'
import { LoginMain } from '../UserManagement/LoginMain'
import NotFound from '../ErrorPage/notfound'
import { AssetMain } from '../AssetPage/AssetMain'
import { AssetOverview } from '../AssetPage/AssetOverview'
import { AssetDashboard } from '../AssetPage/AssetDashboard'
import { AssetDevice } from '../AssetPage/AssetDevice'
import { AssetDeviceDetail } from '../AssetPage/AssetDeviceDetail'
import { AssetReport } from '../AssetPage/AssetReport'
import { AssetAlert } from '../AssetPage/AssetAlert'

// const routes = [
//   { component: AppRoot,
//     routes: [
//       { path: '/',
//         exact: true,
//         component: Home
//       },
//       { path: '/home',
//         component: Home
//       },
//       { path: '/login',
//         component: LoginMain
//       },
//       {
//         path: '*',
//         component: NotFound
//       }
//     ]
//   }
// ];

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
        path: '/asset/:assetID',
        component: AssetMain,
        routes: [
          {
            path: '/asset/:assetID/overview',
            component: AssetOverview
          },
          {
            path: '/asset/:assetID/dashboard',
            component: AssetDashboard
          },
          {
            path: '/asset/:assetID/device',
            component: AssetDevice
          },
          {
            path: '/asset/:assetID/detail/:deviceID',
            component: AssetDeviceDetail
          },
          {
            path: '/asset/:assetID/report',
            component: AssetReport
          },
          {
            path: '/asset/:assetID/alert',
            component: AssetAlert
          }
        ]
      },
      {
        path: '*',
        component: NotFound
      }
    ]
  }
];

export default routes;