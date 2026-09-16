import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/BrandMark';

const schema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(6, 'Password must be at least 6 characters.') });
type FormValues = z.infer<typeof schema>;

export default function SignIn() {
  const { signIn, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async (values: FormValues) => { try { await signIn(values.email, values.password); navigate('/admin'); } catch (error) { setError('root', { message: error instanceof Error ? error.message : 'Unable to sign in.' }); } };
  return <div className="auth-page shell"><div className="auth-panel"><BrandMark /><p className="eyebrow"><span /> House access</p><h1>Welcome<br /><em>back.</em></h1><p className="auth-copy">Sign in to shape the next chapter of KULTURE.</p><form onSubmit={handleSubmit(onSubmit)} noValidate><label>Email address<input type="email" autoComplete="email" {...register('email')} />{errors.email && <small>{errors.email.message}</small>}</label><label>Password<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small>{errors.password.message}</small>}</label>{errors.root && <p className="form-error">{errors.root.message}</p>}<button className="button button--dark button--wide" disabled={isAuthenticating} type="submit">{isAuthenticating ? 'Opening studio...' : 'Enter the studio'}</button></form></div><div className="auth-image"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85" alt="Editorial fashion portrait" /><p>KULTURE / editorial desk</p></div></div>;
}