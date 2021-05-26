/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-05-26 23:20:58
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { transform } from '@babel/core';
import modulePathsResolver from '../src';


/**
 *****************************************
 * 源代码
 *****************************************
 */
const source = `
import React from 'react';
import { named } from 'react/div.ts';
`;


/**
 *****************************************
 * 源代码
 *****************************************
 */
const result = `
import React from 'react';
import { named } from 'react/div.ts';
`;


/**
 *****************************************
 * 测试模块
 *****************************************
 */
describe('module-paths-resolver', () => {
    test('解析别名', () => {
        const { code } = transform(source, {
            babelrc: false,
            plugins: [
                [modulePathsResolver, {
                    alias: {
                        'react$': 'react/dist/index.js',
                        'react': './dist/react',
                    },
                }]
            ]
        });

        // 校验代码
        expect(code).toBe(result);
    });
});
