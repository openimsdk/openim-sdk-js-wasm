# Known openim-sdk-core WASM issues

Baseline: the refreshed remote `v3.8.3-patch.15` tag at commit
`d6e0b549db904d0327d76ef7c9c283203879a095`.

- `UpdateAllConversation` invokes the JavaScript database bridge without the
  conversation payload. The JS handler can only return an explicit error or
  behave as a no-op; it cannot reconstruct the missing value.
- `UpdateOrCreateConversations` returns success without invoking the
  JavaScript database bridge, so a JS implementation cannot make the operation
  effective.
- `DeleteExpireUpload` is not implemented and panics before reaching the
  JavaScript database bridge.
- `Close` resolves its bridge name to `window.close`, which collides with the
  browser-native API. Supporting the current Core contract requires the JS
  bridge to replace that global.
- `getLoginUserID` and `getConversationIDBySessionType` exist in the Go API but
  are not exported by the WASM entry point. They are intentionally not exposed
  by this JS SDK until Core exports them.
