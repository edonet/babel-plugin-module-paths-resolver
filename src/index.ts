/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-05-24 22:57:48
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { resolveAlias, includePaths } from '@ainc/fs';
import { types, NodePath, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { load } from './jsonc';


/**
 *****************************************
 * 配置对象
 *****************************************
 */
interface TSConfig {
    compilerOptions?: {
        baseUrl?: string;
        paths?: {
            [key: string]: string[];
        };
    };
}


/**
 *****************************************
 * 解析配置文件
 *****************************************
 */
const config = (
    load<TSConfig>('./tsconfig.json') ||
    load<TSConfig>('./jsconfig.json') ||
    {}
);


/**
 *****************************************
* 校验调用加载函数
*****************************************
*/
function validateCallExpr(args: ({ type: string })[], parent: types.Node): boolean {
    return (
        args.length === 1 &&
        args[0].type === 'StringLiteral' &&
        parent.type !== 'ExpressionStatement'
    );
}


/**
 *****************************************
 * 转换载入声明
 *****************************************
 */
 function transformImport(expr: NodePath<types.ImportDeclaration | types.ExportDeclaration>, state: PluginPass): void {
    const source = expr.get('source') as NodePath<types.StringLiteral>;

    // 不存在资源
    if (!types.isStringLiteral(source)) {
        return;
    }

    // 获取解析函数
    const resolvePath = state.resolvePath as (path: string) => string;

    // 不存在解析函数
    if (!resolvePath) {
        return;
    }

    // 获取路径
    const sourcePath = source.node.value;
    const resolvedPath = resolvePath(sourcePath);

    // 替换路径
    if (sourcePath !== resolvedPath) {
        source.replaceWith(types.stringLiteral(resolvedPath));
    }
}


/**
 *****************************************
 * 转换调用声明
 *****************************************
 */
function transformCall(expr: NodePath<types.CallExpression>): void {
  console.log(expr);
}


/**
 *****************************************
 * 插件配置
 *****************************************
 */
interface Options {
    alias?: { [key: string]: string };
    exclude?: string[];
}


/**
 *****************************************
 * 定义插件
 *****************************************
 */
export default declare((api, opts: Options = {}) => {
    const include = includePaths(opts.exclude || ['node_modules']);
    const resolvePath = resolveAlias({
        alias: opts.alias,
        baseUrl: config.compilerOptions?.baseUrl,
        paths: config.compilerOptions?.paths,
    });

    // 校验版本
    api.assertVersion(7);

    // 返回插件配置
    return {
        name: 'module-paths-resolver',
        pre(file) {
            const { filename } = file.opts;

            // 过滤文件
            if (!filename || !include(filename)) {
                this.resolvePath = resolvePath;
            }
        },
        visitor: {
            ImportDeclaration: transformImport,
            ExportDeclaration: transformImport,
            CallExpression: transformCall,
        },
    };
});
