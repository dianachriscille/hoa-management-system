import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  unitNumber: z.string().min(1, 'Required'),
  contactNumber: z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Must include uppercase, lowercase, and number'),
  vehiclePlate1: z.string().optional(),
  vehiclePlate2: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'You must accept the data privacy consent' }) }),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Personal Info', 'Account', 'Optional Info', 'Consent'];

export function RegisterPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { register, handleSubmit, trigger, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const stepFields: (keyof FormData)[][] = [
    ['firstName', 'lastName', 'unitNumber', 'contactNumber'],
    ['email', 'password'],
    ['vehiclePlate1', 'vehiclePlate2', 'emergencyContactName', 'emergencyContactNumber'],
    ['consentGiven'],
  ];

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register({ ...data, consentGiven: true });
      navigate('/verify-email-sent');
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Create Account</h1>
        <div className="flex justify-between mb-6">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs font-medium ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
          ))}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} data-testid="register-form" className="space-y-4">
          {step === 0 && <>
            <input data-testid="register-firstname-input" placeholder="First Name" {...register('firstName')} className="w-full border rounded px-3 py-2" />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            <input data-testid="register-lastname-input" placeholder="Last Name" {...register('lastName')} className="w-full border rounded px-3 py-2" />
            <input data-testid="register-unit-input" placeholder="Unit Number" {...register('unitNumber')} className="w-full border rounded px-3 py-2" />
            {errors.unitNumber && <p className="text-red-500 text-sm">{errors.unitNumber.message}</p>}
            <input data-testid="register-contact-input" placeholder="Contact Number (09XXXXXXXXX)" {...register('contactNumber')} className="w-full border rounded px-3 py-2" />
            {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>}
          </>}
          {step === 1 && <>
            <input data-testid="register-email-input" type="email" placeholder="Email" {...register('email')} className="w-full border rounded px-3 py-2" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            <input data-testid="register-password-input" type="password" placeholder="Password" {...register('password')} className="w-full border rounded px-3 py-2" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </>}
          {step === 2 && <>
            <input placeholder="Vehicle Plate 1 (optional)" {...register('vehiclePlate1')} className="w-full border rounded px-3 py-2" />
            <input placeholder="Vehicle Plate 2 (optional)" {...register('vehiclePlate2')} className="w-full border rounded px-3 py-2" />
            <input placeholder="Emergency Contact Name (optional)" {...register('emergencyContactName')} className="w-full border rounded px-3 py-2" />
            <input placeholder="Emergency Contact Number (optional)" {...register('emergencyContactNumber')} className="w-full border rounded px-3 py-2" />
          </>}
          {step === 3 && <>
            <div className="text-sm text-gray-600 border rounded p-3 max-h-40 overflow-y-auto">
              <p className="font-medium mb-2">Data Privacy Consent (Philippines DPA 2012)</p>
              <p>By registering, you consent to the HOA collecting and processing your personal data (name, unit number, contact details, vehicle information) for HOA management purposes in accordance with Republic Act No. 10173.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input data-testid="register-consent-checkbox" type="checkbox" {...register('consentGiven')} className="w-4 h-4" />
              <span className="text-sm">I consent to the collection and processing of my personal data</span>
            </label>
            {errors.consentGiven && <p className="text-red-500 text-sm">{errors.consentGiven.message}</p>}
          </>}
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          <div className="flex gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 border rounded py-2">Back</button>}
            {step < STEPS.length - 1
              ? <button data-testid="register-next-button" type="button" onClick={next} className="flex-1 bg-blue-600 text-white py-2 rounded">Next</button>
              : <button data-testid="register-submit-button" type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create Account'}</button>
            }
          </div>
          <p className="text-center text-sm"><Link to="/login" className="text-blue-600 hover:underline">Already have an account?</Link></p>
        </form>
      </div>
    </div>
  );
}
