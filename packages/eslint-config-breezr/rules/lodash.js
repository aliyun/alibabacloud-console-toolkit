module.exports = {
  /*
   * 推荐用 native methods
   */
  'lodash/prefer-lodash-method': 0,
  /*
   * 不要强行使用 _.constant 或 import _constant from 'lodash/constant'
   */
  'lodash/prefer-constant': 0,
  /*
   * 推荐 import _xx from 'lodash/xx'（且方法名前带上 `_` 表示这个方法是从 lodash 来的）
   */
  'lodash/import-scope': [2, 'method']
};
