'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi } from '@/app/services/api';
import { UserRole } from '../user/const/userRoles';
import { sendError } from '@/helpModule/Massages';
import { Toaster } from 'sonner';
import styles from './page.module.css';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { siGoogle, siTelegram } from 'simple-icons/icons';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    document.title = 'Login';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let response;

      if (isRegister) {
        response = await userApi.create({
          ...values,
        });
      } else {
        response = await userApi.login({
          ...values,
          role: UserRole,
        });
      }

      const token = response.data.access_token;
      const role = response.data.user?.role || UserRole;
      const userId = response.data.user?.id;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        if (userId) {
          localStorage.setItem('userId', userId);
        }
      }

      router.push('/home');
    } catch (err: unknown) {
      const error = err as AxiosError<{
        message?: string;
        statusCode?: number;
      }>;

      sendError(
        'Error',
        error.response?.data?.message || error.message || 'Unknown error',
      );
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            {isRegister ? 'REGISTER' : 'LOGIN'}
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={styles.form}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={styles.formItem}>
                    <FormLabel className={styles.formLabel}>Email</FormLabel>
                    <FormControl>
                      <Input
                        className={styles.input}
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.formMessage} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className={styles.formItem}>
                    <FormLabel className={styles.formLabel}>Password</FormLabel>
                    <FormControl>
                      <Input
                        className={styles.input}
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.formMessage} />
                  </FormItem>
                )}
              />
              <Button className={styles.button} type="submit">
                {isRegister ? 'Register' : 'Login'}
              </Button>
            </form>
          </Form>

          <div className={`${styles.textCenter} ${styles.mt4}`}>
            <Button
              variant="link"
              onClick={() => setIsRegister(!isRegister)}
              className={styles.linkButton}
            >
              {isRegister
                ? 'Have an account? Login'
                : "Don't have an account? Register"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
