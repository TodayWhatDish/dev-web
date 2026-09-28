## OverView
'오늘 뭐멍냥' 프로젝트의 웹쪽을 담당하는 레포지토리로 관리자 대시보드와 간단한 사용자 서비스 화면을 구축한다.

## Reference
동일 폴더에 존재하는 'dev-data-embed'

## Rule

## Archetecture
- admin
- +

## Security-Authorization
추후 Supabase를 사용하여 계정을 연동하지만, 현재는 Fast API + JWT 인증방식을 사용하여 유저정보를 갱신한다.

## Logging

## PR Guid
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
