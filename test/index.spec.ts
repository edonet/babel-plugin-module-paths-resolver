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
import { named } from "./../src/dist/react/div.ts";
import Vue from "vue";
import Store from "./../src/dist/vue/dist/store";
import app from "@";
import * as jsonc from "./../src/jsonc";
import * as utils from "./../src/app/utils";
import("./../src/dist/react/index.js");
require("./../src/jsonc");
require.resolve("./../src/jsonc");
jest.mock("./../src/mock");
jest.requireMock("./../src/mock");
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
            filename: __filename,
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
