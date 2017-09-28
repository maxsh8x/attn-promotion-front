function GetAppConfig() {
  return require(`../../config.${process.env.NODE_ENV}.json`);
}

export default new GetAppConfig();
