import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '.next', 'out', 'build', '.vercel'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 마이그레이션 진행 중 옛 페이지 dormant — 점진 강화 예정
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 경계 규칙 — 선언만 하던 의존 방향을 기계가 막는다.
  // 방향은 app → features → services/lib/store 이고 역방향은 없다.
  //
  // 주의: flat config에서 같은 규칙명은 병합되지 않고 뒤 블록이 앞을 통째로 덮는다.
  // 그래서 axios 제한과 feature 제한을 한 블록에 함께 둔다 — 나누면 하나가 죽는다.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/api.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'axios',
          message: 'HTTP 호출은 @/lib/api의 api 인스턴스를 쓴다 — 토큰·refresh 인터셉터가 거기 걸려 있다.',
        }],
      }],
    },
  },
  {
    files: ['src/components/**', 'src/lib/**', 'src/services/**', 'src/store/**', 'src/hooks/**'],
    ignores: ['src/lib/api.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'axios',
          message: 'HTTP 호출은 @/lib/api의 api 인스턴스를 쓴다 — 토큰·refresh 인터셉터가 거기 걸려 있다.',
        }],
        patterns: [{
          group: ['@/features/*', '@/features/*/**'],
          message:
            '공유 영역은 feature를 import하지 않는다. 화면에 매인 것이면 그 feature 안으로, ' +
            '앱 전체 골격이면 app/layout으로 옮겨라.',
        }],
      }],
    },
  },
);
