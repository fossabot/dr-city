import { promiseQueue } from 'dr-js/module/common/function'
import { runCommand } from 'dr-js/module/node/module/Command'

const COMMAND_CONFIG_LIST_WINDOWS = [
  { name: 'GENERAL', command: 'systeminfo' }
]

const COMMAND_CONFIG_LIST_LINUX = [
  { name: 'GENERAL', command: 'vmstat' },
  { name: 'NETWORK', command: 'vnstat -s' },
  { name: 'MEMORY', command: 'free -h' },
  { name: 'DISK', command: 'df -h' },
  { name: 'DIRECTORY', command: 'du -h -d1' },
  { name: 'TOP', command: 'top -b -n 1 | head -n 5' },
  { name: 'DATE', command: 'date' }
]

const COMMAND_CONFIG_LIST = (process.platform.includes('nux') || process.platform.includes('darwin')) ? COMMAND_CONFIG_LIST_LINUX
  : process.platform.includes('win') ? COMMAND_CONFIG_LIST_WINDOWS
    : []

const getServerStatus = async () => {
  const asyncTaskList = COMMAND_CONFIG_LIST.map((config) => () => runCommand(config.command))
  const { resultList } = await promiseQueue({ asyncTaskList, shouldContinueOnError: true })
  const serverStatusList = COMMAND_CONFIG_LIST.map((config, index) => ({ config, status: resultList[ index ] }))
  return { platform: process.platform, serverStatusList }
}

export { getServerStatus }
