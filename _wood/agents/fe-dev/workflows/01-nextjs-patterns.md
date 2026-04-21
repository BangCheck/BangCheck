<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# FE Workflow 01 — Next.js Patterns (Quick Reference)

> **Agent:** Frontend Developer
> **Purpose:** Frequently used Next.js patterns + Korean UI rules for SWYP
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Frontend]`
- Check Next.js version: `cat package.json | jq .dependencies.next`

---

## 🧭 When to use this

This workflow is for **reference**:
- When creating a new component
- When a pattern is unclear
- When you need to revisit team conventions

---

## 📁 Project Structure (App Router)

```
src/
├── app/                    ← Next.js App Router
│   ├── layout.tsx          ← Root layout (required)
│   ├── page.tsx            ← Root page
│   ├── (auth)/             ← Route group (parentheses = excluded from URL)
│   │   └── login/
│   │       └── page.tsx
│   └── api/                ← Route Handlers
│       └── auth/
│           └── route.ts
│
├── components/             ← Reusable components
│   ├── ui/                 ← Atomic units (Button, Input)
│   └── features/           ← Feature units (LoginForm, MapView)
│
├── lib/                    ← Utils/helpers
│   ├── api/                ← API client
│   └── validators/         ← Validation
│
└── types/                  ← Global types
```

---

## 🔄 Server vs Client Component

```tsx
// Server (default, no 'use client')
// - Can fetch data directly (DB/API)
// - Good for SEO
// - No interactivity (useState/onClick causes error)

export default async function ProductPage() {
  const data = await fetchFromDB();
  return <div>{data.name}</div>;
}
```

```tsx
// Client ('use client' at the top)
// - Supports interactivity (useState, useEffect, onClick)
// - Requires hydration (increases bundle size)

'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}
```

**Selection principle:**
- Default to **Server**
- Use **Client** when interactivity is needed
- Place Client at the leaf of the subtree (keep upper layers as Server as much as possible)

---

## 🔗 API Call Patterns

### In Server Component

```tsx
async function page() {
  const res = await fetch(`${process.env.API_URL}/auth`, {
    cache: 'no-store',  // or 'force-cache' (default)
  });
  const data = await res.json();
  return <div>{data.title}</div>;
}
```

### In Client Component

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';

function LoginStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-status'],
    queryFn: () => fetch('/api/auth/status').then(r => r.json()),
  });
  if (isLoading) return <Skeleton />;
  return <div>{data.email}</div>;
}
```

### Server Action (Form submission)

```tsx
// app/(auth)/login/actions.ts
'use server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  // Validation
  // API call
  // redirect
}

// app/(auth)/login/page.tsx
import { loginAction } from './actions';

export default function LoginPage() {
  return (
    <form action={loginAction}>
      <input name="email" type="email" />
      <button>로그인</button>
    </form>
  );
}
```

---

## 📱 Mobile First (Tailwind)

```tsx
// Mobile base → tablet/desktop expansion

<div className="
  flex flex-col gap-2 p-4        // mobile (360px~)
  sm:flex-row sm:gap-4 sm:p-6    // 640px~
  md:p-8                          // 768px~
  lg:max-w-7xl lg:mx-auto        // 1024px~
">
  ...
</div>
```

**Minimum tap target 44x44px:**

```tsx
<button className="min-w-[44px] min-h-[44px] p-2">
  ...
</button>
```

**Safe Area (iOS notch):**

```tsx
<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  ...
</div>
```

---

## ♿ Accessibility Baseline

```tsx
// ✅ Good
<button onClick={handleClick} aria-label="로그인">
  <Icon />
</button>

<Input
  id="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && <span id="email-error">이메일 형식이 올바르지 않습니다</span>}

// ❌ Bad
<div onClick={handleClick}>  // should be a button
<input />  // missing label
```

**Keyboard navigation:**
- All interactions reachable via Tab
- Activated with Enter/Space
- Close modal with Escape

---

## 💬 Korean UI Rules (SWYP)

### Error Messages

```tsx
// ❌ English exposed
throw new Error('Invalid email')
<span>Error</span>

// ❌ Mechanical Korean
<span>오류</span>

// ✅ Polite Korean
<span>일시적인 오류가 발생했습니다. 다시 시도해주세요.</span>
```

### Button Text

| Context | Example |
|---------|---------|
| Submit | "로그인", "회원가입", "저장하기" |
| Cancel | "취소", "뒤로가기", "닫기" |
| Danger | "삭제", "확인" (use danger variant) |

### Loading State

```tsx
{isPending ? (
  <>
    <Spinner />
    <span>저장 중...</span>   {/* verb + ... */}
  </>
) : (
  '저장하기'
)}
```

### Empty State

```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <p>아직 등록된 항목이 없어요</p>
    <button>첫 항목 추가하기</button>
  </div>
)}
```

---

## 🧪 Test Pattern

```tsx
// src/components/LoginForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('이메일 형식 검증', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('이메일'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(
      screen.getByText(/이메일 형식이 올바르지 않습니다/)
    ).toBeInTheDocument();
  });
});
```

---

## 📚 References

- Next.js App Router: `node_modules/next/dist/docs/`
- Tailwind: https://tailwindcss.com/docs
- Project conventions: [docs/team-conventions.md](../../../../docs/team-conventions.md)
- Coding guide: [_wood/workflows/_CODING-GUIDE.md](../../workflows/_CODING-GUIDE.md)

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
