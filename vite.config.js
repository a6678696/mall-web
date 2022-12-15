import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
//引入path模块,用来设置路径别名
import path from "path"
//用于自动导入Element Plus组件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        //用于自动导入Element Plus组件
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        //用于自动导入Element Plus组件
        Components({
            resolvers: [ElementPlusResolver()],
        })
    ],
    server: {
        port: 8888,
        open: true
    },
    resolve: {
        //配置路径别名
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})
