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
import { cwd } from '@ainc/fs';
import { transform } from '@babel/core';
import modulePathsResolver from '../src';


/**
 *****************************************
 * 源代码
 *****************************************
 */
const source = `
import React from "react";
import { named } from "react/div.ts";
import Vue from "vue";
import Store from "vue/store";
import app from "@";
import * as jsonc from "@/jsonc";
import * as utils from "@app/utils";
import("react/index.js");
require("@/jsonc");
require.resolve("@/jsonc");
jest.mock("@/mock");
jest.requireMock("@/mock");
`;


/**
 *****************************************
 * 源代码
 *****************************************
 */
const result = `
import React from "react/dist/index.js";
import { named } from "${cwd('./src/dist/react/div.ts')}";
import Vue from "vue";
import Store from "${cwd('./src/dist/vue/dist/store')}";
import app from "@";
import * as jsonc from "${cwd('./src/jsonc')}";
import * as utils from "${cwd('./src/app/utils')}";
import("${cwd('./src/dist/react/index.js')}");
require("${cwd('./src/jsonc')}");
require.resolve("${cwd('./src/jsonc')}");
jest.mock("${cwd('./src/mock')}");
jest.requireMock("${cwd('./src/mock')}");
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
                        'vue/': './dist/vue/dist/',
                    },
                    calls: [
                        'jest.mock',
                        'jest.requireMock',
                    ],
                }]
            ]
        });

        // 校验代码
        expect(code.replace(/^\n/gm, '')).toBe(result.trim());
    });
});
