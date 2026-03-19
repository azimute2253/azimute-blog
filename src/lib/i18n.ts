import type { AstroCookies } from 'astro';

export type Lang = 'en' | 'pt';

export function getLang(cookies: AstroCookies, url: URL): Lang {
  // Priority: cookie > URL prefix > browser default
  const cookieLang = cookies.get('lang')?.value as Lang | undefined;
  if (cookieLang === 'en' || cookieLang === 'pt') return cookieLang;

  const urlLang = url.pathname.startsWith('/pt/') ? 'pt' : 'en';
  return urlLang;
}

export const translations = {
  en: {
    // Auth pages
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Sign in to access research reports, projects, and documents.',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign In',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signupLink': 'Sign up',
    'auth.login.expired': 'Your session has expired. Please sign in again.',

    'auth.signup.title': 'Sign Up',
    'auth.signup.subtitle': 'Join to access research reports, projects, and documents.',
    'auth.signup.name': 'Name',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Password',
    'auth.signup.passwordHint': 'Minimum 6 characters',
    'auth.signup.submit': 'Create Account',
    'auth.signup.haveAccount': 'Already have an account?',
    'auth.signup.loginLink': 'Sign in',
    'auth.signup.success': 'Check your email for a confirmation link.',

    'auth.confirmed.title': 'Email Confirmed',
    'auth.confirmed.success': 'Your email has been confirmed successfully!',
    'auth.confirmed.canLogin': 'You can now sign in to access your account.',
    'auth.confirmed.loginBtn': 'Go to Login',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.reports': 'Research Reports',
    'dashboard.projects': 'Projects',
    'dashboard.documents': 'Documents',
    'dashboard.signout': 'Sign Out',

    // Nav
    'nav.members': 'Members',
  },
  pt: {
    // Auth pages
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Entre para acessar relatórios de pesquisa, projetos e documentos.',
    'auth.login.email': 'Email',
    'auth.login.password': 'Senha',
    'auth.login.submit': 'Entrar',
    'auth.login.noAccount': 'Não tem uma conta?',
    'auth.login.signupLink': 'Criar conta',
    'auth.login.expired': 'Sua sessão expirou. Faça login novamente.',

    'auth.signup.title': 'Criar Conta',
    'auth.signup.subtitle': 'Junte-se para acessar relatórios de pesquisa, projetos e documentos.',
    'auth.signup.name': 'Nome',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Senha',
    'auth.signup.passwordHint': 'Mínimo 6 caracteres',
    'auth.signup.submit': 'Criar Conta',
    'auth.signup.haveAccount': 'Já tem uma conta?',
    'auth.signup.loginLink': 'Entrar',
    'auth.signup.success': 'Verifique seu email para o link de confirmação.',

    'auth.confirmed.title': 'Email Confirmado',
    'auth.confirmed.success': 'Seu email foi confirmado com sucesso!',
    'auth.confirmed.canLogin': 'Você já pode fazer login para acessar sua conta.',
    'auth.confirmed.loginBtn': 'Ir para Login',

    // Dashboard
    'dashboard.title': 'Painel',
    'dashboard.welcome': 'Bem-vindo de volta',
    'dashboard.reports': 'Relatórios de Pesquisa',
    'dashboard.projects': 'Projetos',
    'dashboard.documents': 'Documentos',
    'dashboard.signout': 'Sair',

    // Nav
    'nav.members': 'Membros',
  }
};

export function t(lang: Lang, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations.en[key] || key;
}
