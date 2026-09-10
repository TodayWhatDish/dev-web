/** @type {import('next').NextConfig} */
const nextConfig = {
  // frontend/public/index.html의 meta-refresh 리다이렉트를 대체한다 - "/"는 실제 랜딩 페이지가 아니다.
  async redirects() {
    return [{ source: "/", destination: "/customer", permanent: true }];
  },
};

export default nextConfig;
