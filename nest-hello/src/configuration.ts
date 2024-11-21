import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { merge } from 'lodash';
const basisfilename = 'default.yml';
const envpathfileName = `${process.env.NODE_ENV || 'development'}.yml`;

function readYamlFile(fileName) {
  // 获取文件路径
  const filePath = join(__dirname, './config', fileName);
  const file = readFileSync(filePath, 'utf8');
  const data = yaml.load(file);
  return data;
}

export default () => {
  // 通过lodash中的merge方法合并
  return merge(readYamlFile(basisfilename), readYamlFile(envpathfileName));
};
