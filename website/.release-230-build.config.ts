import config from './docusaurus.config';
export default {...config, future: {...config.future, experimental_vcs: false}};
