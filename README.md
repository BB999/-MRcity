# MR City Diorama

街のジオラマをMR（Mixed Reality）で体験できるReactアプリケーションです。

## 特徴

- 🏙️ 3D街並みジオラマの表示
- 🥽 VR/ARモードの切り替え対応
- ✋ ハンドトラッキング対応
- 🎮 インタラクティブな建物操作

## 技術スタック

- **React** + **TypeScript**
- **Three.js** + **@react-three/fiber**
- **@react-three/xr** (WebXR対応)
- **@react-three/drei** (3Dヘルパー)

## 起動方法

1. 依存関係のインストール:
   ```bash
   npm install
   ```

2. 開発サーバーの起動:
   ```bash
   npm run dev
   ```

3. ブラウザでアクセス:
   - PC: https://localhost:3000
   - モバイル/HMD: https://[your-ip]:3000

## モード切り替え

- **通常モード**: マウス・タッチで3Dシーンを操作
- **VRモード**: VRヘッドセット対応
- **ARモード**: スマートフォン/ARデバイス対応

## インタラクション

- 建物にホバー：浮遊効果
- 建物をクリック：回転エフェクト
- VR/ARモード：ハンドトラッキング対応

## WebXR対応デバイス

- **VR**: Meta Quest、HTC Vive、Valve Index など
- **AR**: Android Chrome、iOS Safari (WebXR対応版)
- **PC**: Chrome、Edge、Firefox (WebXR実験的機能を有効化)

## 注意事項

- WebXRにはHTTPS環境が必要です
- モバイルARは対応デバイス・ブラウザが限定的です
- VRモードはWebXR対応ヘッドセットが必要です