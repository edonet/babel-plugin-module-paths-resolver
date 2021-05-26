/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-05-26 23:01:35
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { stat, readFile } from '@ainc/fs';
import stripComments from 'strip-json-comments';


/**
 *****************************************
 * 加载配置
 *****************************************
 */
export function load<T>(file: string): T | null {
    const stats = stat(file);

    // 不存在文件
    if (!stats || !stats.isFile()) {
        return null;
    }

    // 读取文件
    try {
        const content = stripComments(readFile(stats.path));

        // 空白文件
        if (!content.trim()) {
            return null;
        }

        // 解析文件
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}


