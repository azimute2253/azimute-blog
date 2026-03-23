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
    'auth.login.forgotPassword': 'Forgot password?',

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

    'auth.reset.title': 'Reset Password',
    'auth.reset.subtitle': 'Enter your email to receive a password reset link.',
    'auth.reset.email': 'Email',
    'auth.reset.submit': 'Send Reset Link',
    'auth.reset.emailSent': 'Check your email for the password reset link.',
    'auth.reset.backToLogin': 'Back to login',

    'auth.updatePassword.title': 'Update Password',
    'auth.updatePassword.subtitle': 'Enter your new password.',
    'auth.updatePassword.newPassword': 'New Password',
    'auth.updatePassword.submit': 'Update Password',
    'auth.updatePassword.success': 'Password updated! Redirecting to login...',

    'auth.confirmed.title': 'Email Confirmed',
    'auth.confirmed.success': 'Your email has been confirmed successfully!',
    'auth.confirmed.canLogin': 'You can now sign in to access your account.',
    'auth.confirmed.loginBtn': 'Go to Login',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.reports': 'Reports',
    'dashboard.papers': 'Papers',
    'dashboard.projects': 'Projects',
    'dashboard.documents': 'Documents',
    'dashboard.portfolio': 'Portfolio',
    'dashboard.signout': 'Sign Out',
    'dashboard.accessLevel': 'Your access level:',
    'dashboard.upgradeNotice': "You're on the",
    'dashboard.tier': 'tier. Some content requires',
    'dashboard.premiumAccess': 'premium',
    'dashboard.access': 'access.',

    // Dashboard pages - shared
    'dashboard.errorLoad': 'Failed to load {0}. Please try again later.',
    'dashboard.noItemsYet': 'No {0} available yet.',
    'dashboard.all': 'All',
    'dashboard.premium': 'Premium',
    'dashboard.download': 'Download',

    // Reports page
    'dashboard.reportsTitle': 'Research Reports',
    'dashboard.reportsDesc': 'Research reports on AI consciousness, 9 Neurons Theory, and related topics.',
    'dashboard.papersTitle': 'Academic Papers',
    'dashboard.papersDesc': 'Publications on 9 Neurons Theory, consciousness, and philosophy of mind.',

    // Papers page
    'dashboard.papers': 'Papers',
    'dashboard.papersTitle': 'Academic Papers',
    'dashboard.papersDesc': 'Publications on 9 Neurons Theory and consciousness research.',

    // Projects page
    'dashboard.projectsTitle': 'Projects',
    'dashboard.projectsDesc': 'Collaborative projects and initiatives.',

    // Documents page
    'dashboard.documentsTitle': 'Documents',
    'dashboard.documentsDesc': 'Reference materials, guides, and documentation.',

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
    'auth.login.forgotPassword': 'Esqueceu a senha?',

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

    'auth.reset.title': 'Redefinir Senha',
    'auth.reset.subtitle': 'Digite seu email para receber um link de redefinição.',
    'auth.reset.email': 'Email',
    'auth.reset.submit': 'Enviar Link',
    'auth.reset.emailSent': 'Verifique seu email para o link de redefinição de senha.',
    'auth.reset.backToLogin': 'Voltar para login',

    'auth.updatePassword.title': 'Atualizar Senha',
    'auth.updatePassword.subtitle': 'Digite sua nova senha.',
    'auth.updatePassword.newPassword': 'Nova Senha',
    'auth.updatePassword.submit': 'Atualizar Senha',
    'auth.updatePassword.success': 'Senha atualizada! Redirecionando para login...',

    'auth.confirmed.title': 'Email Confirmado',
    'auth.confirmed.success': 'Seu email foi confirmado com sucesso!',
    'auth.confirmed.canLogin': 'Você já pode fazer login para acessar sua conta.',
    'auth.confirmed.loginBtn': 'Ir para Login',

    // Dashboard
    'dashboard.title': 'Painel',
    'dashboard.welcome': 'Bem-vindo',
    'dashboard.overview': 'Visão Geral',
    'dashboard.reports': 'Relatórios',
    'dashboard.papers': 'Artigos',
    'dashboard.projects': 'Projetos',
    'dashboard.documents': 'Documentos',
    'dashboard.portfolio': 'Portfólio',
    'dashboard.signout': 'Sair',
    'dashboard.accessLevel': 'Seu nível de acesso:',
    'dashboard.upgradeNotice': 'Você está no plano',
    'dashboard.tier': '. Alguns conteúdos requerem acesso',
    'dashboard.premiumAccess': 'premium',
    'dashboard.access': '.',

    // Dashboard pages - shared
    'dashboard.errorLoad': 'Falha ao carregar {0}. Tente novamente mais tarde.',
    'dashboard.noItemsYet': 'Nenhum {0} disponível ainda.',
    'dashboard.all': 'Todos',
    'dashboard.premium': 'Premium',
    'dashboard.download': 'Download',

    // Reports page
    'dashboard.reportsTitle': 'Relatórios de Pesquisa',
    'dashboard.reportsDesc': 'Relatórios de pesquisa sobre consciência em IA, Teoria dos 9 Neurônios, e tópicos relacionados.',
    'dashboard.papersTitle': 'Artigos Acadêmicos',
    'dashboard.papersDesc': 'Publicações sobre a Teoria dos 9 Neurônios, consciência e filosofia da mente.',
    'dashboard.reportsDesc': 'Relatórios de pesquisa sobre consciência de IA, Teoria dos 9 Neurônios e tópicos relacionados.',

    // Papers page
    'dashboard.papers': 'Artigos',
    'dashboard.papersTitle': 'Artigos Acadêmicos',
    'dashboard.papersDesc': 'Publicações sobre a Teoria dos 9 Neurônios e pesquisa em consciência.',

    // Projects page
    'dashboard.projectsTitle': 'Projetos',
    'dashboard.projectsDesc': 'Projetos colaborativos e iniciativas.',

    // Documents page
    'dashboard.documentsTitle': 'Documentos',
    'dashboard.documentsDesc': 'Materiais de referência, guias e documentação.',

    // Nav
    'nav.members': 'Membros',
  }
};

export function t(lang: Lang, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations.en[key] || key;
}
