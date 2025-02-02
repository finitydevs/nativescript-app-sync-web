import { AccessKey, App, Deployment } from 'src/types/api'
import { axios } from 'src/utils/axios'

interface IApiResponseBase {
  status?: 'OK' | 'ERROR'
  errorMessage?: string
}

// AUTH
interface LoginResponse extends IApiResponseBase { results: { tokens: string } }
interface AuthenticatedResponse extends IApiResponseBase { authenticated: boolean, user: { email: string, username: string, id: number } }

export const login = (account: string, password: string) => axios.post<LoginResponse>('/auth/login', { account, password, minutes: 43200 })
export const changePassword = (oldPassword: string, newPassword: string) => axios.patch('/users/password', { oldPassword, newPassword })
export const authenticated = () => axios.get<AuthenticatedResponse>('/authenticated')

// REGISTER
interface CheckEmailExistsResponse extends IApiResponseBase { exists: boolean }

export const register = (email: string, password: string, token: string) => axios.post<IApiResponseBase>('/users', { email, password, token })
export const checkEmailExists = (email: string) => axios.get<CheckEmailExistsResponse>(`/users/exists?email=${encodeURI(email)}`)
export const sendRegisterCode = (email: string) => axios.post<IApiResponseBase>('/users/registerCode', { email })
export const checkRegisterCodeExists = (email: string, code: string) => {
  const query = `email=${encodeURI(email)}&token=${encodeURI(code)}`
  return axios.get<IApiResponseBase>(`/users/registerCode/exists?${query}`)
}

// ACCESS KEYS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GetAccessKeysResponse extends IApiResponseBase { accessKeys: AccessKey[] }
interface CreateAccessKeysResponse extends IApiResponseBase { accessKey: AccessKey }

export const getAccessKeys = () => axios.get<GetAccessKeysResponse>('/accessKeys')
export const createAccessKey = ({ name = '', ttl = 0, description = '' }) => {
  const time = new Date().getTime()
  const createdBy = 'UI'
  const oneDayInMilliseconds = 86400000
  const expiresIn = oneDayInMilliseconds * ttl
  const isSession = true;
  const friendlyName = name || `UI-${time}`
  return axios.post<CreateAccessKeysResponse>('/accessKeys', {
    friendlyName, ttl: expiresIn, createdBy, isSession, description
  })
}
export const removeAccessKey = (name: string) => axios.delete<IApiResponseBase>(`/accessKeys/${encodeURI(name)}`)
export const patchAccessKey = (name: string, friendlyName: string, ttl = 0) => axios.patch(`/accessKeys/${encodeURI(name)}`, { friendlyName, ttl })

// APPS
type DeploymentType = 'Staging' | 'Production'
type ReleaseMethod = 'Upload' | 'Promote' | 'Rollback'
type DiffPackageMap = {
  [key: string]: {
    url: string
    size: number
  };
}
export interface DeploymentHistory {
  description: string
  isDisabled: boolean
  isMandatory: boolean
  rollout: number
  appVersion: string
  packageHash: string
  blobUrl: string
  size: number
  manifestBlobUrl: string
  diffPackageMap: DiffPackageMap | null
  releaseMethod: ReleaseMethod
  uploadTime: number
  originalLabel: string
  originalDeployment: string
  label: string
  releasedBy: string
}

interface GetAppsResponse extends IApiResponseBase { apps: App[] }
interface AddAppResponse extends IApiResponseBase { app: App }
interface GetDeploymentsResponse extends IApiResponseBase { deployments: Deployment[] }
interface GetDeploymentHistoryResponse extends IApiResponseBase { history: DeploymentHistory[] }

export const getApps = () => axios.get<GetAppsResponse>('/apps')
export const getDeployments = (appName: string) => axios.get<GetDeploymentsResponse>(`/apps/${appName}/deployments`)
export const getDeploymentHistory = (appName: string, deploymentName: DeploymentType) => axios.get<GetDeploymentHistoryResponse>(`/apps/${appName}/deployments/${deploymentName}/history`)
export const addApp = (name: string, os: string, platform: string) => axios.post<AddAppResponse>('/apps', { name, os, platform })
export const removeApp = (name: string) => axios.delete<IApiResponseBase>(`/apps/${encodeURI(name)}`)

// READMEs
export const buildReadmeUrl = () => '/README.md' // TODO put this readme as markdown on the front end?
export const buildWebUsageUrl = () => '/WEB_USAGE.md' // TODO put this readme as markdown on the front end?
