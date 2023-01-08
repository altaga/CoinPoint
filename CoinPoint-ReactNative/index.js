/**
 * @format
 */

// Modules
import "react-native-get-random-values"
import 'react-native-url-polyfill/auto'
import 'localstorage-polyfill';
// Shims
import './shim'
import "@ethersproject/shims"
// Default
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);