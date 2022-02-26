import t from 'ts-runtime/lib';

import fs from "fs";
import yaml from "js-yaml";
import loadYamlRefs from './loadYamlRefs';
import buildTemplates from './loadYamlTemplates';
import IYamlWithRef from '../IYamlWithRef';
export const refsPath: fs.PathLike = "./src/data/oracles/_refs/";
export default function concatWithYamlRefs(referencePath: fs.PathLike = refsPath, ...filePaths: fs.PathLike[]) {
  const refFiles: fs.PathLike[] = fs.readdirSync(refsPath);
  let refString = loadYamlRefs(referencePath);
  let templateString = buildTemplates(referencePath + "/templates/");
  const fileStrings: string[] = filePaths.map(path => fs.readFileSync(path, { encoding: "utf-8" }));
  const dataStrings: string[] = [refString, templateString, ...fileStrings];
  const dataObject: IYamlWithRef = yaml.load(dataStrings.join("\n\n")) as IYamlWithRef;
  return dataObject;
}

