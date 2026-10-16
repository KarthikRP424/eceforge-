import React, { useState } from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    document.title = 'Contact & Support | ECEForge';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been sent to the ECEForge team.');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumb items={[{ label: 'Contact' }]} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Contact ECEForge
          </h1>
          <p className="text-sm text-navy-600 mt-1 max-w-xl">
            Have questions about syllabus materials, resource corrections, or wish to contribute notes as a student coordinator? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h3 className="text-lg font-bold text-navy-900">Message Received</h3>
                <p className="text-xs text-navy-600 max-w-sm mx-auto">
                  Thank you for writing to us. Our student community team will review your feedback or resource request shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name *"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Subject *"
                  placeholder="e.g. Suggestion for 5th Sem VLSI Notes"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />

                <Textarea
                  label="Message *"
                  placeholder="Tell us more about your query, suggestion, or resource submission..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" leftIcon={<Send size={15} />}>
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Mail size={18} />
              </div>
              <h3 className="font-semibold text-navy-900 text-sm">Direct Email</h3>
              <p className="text-xs text-navy-500">
                For administrative or DMCA inquiries:
              </p>
              <p className="text-xs font-mono text-cyan-700">contact@eceforge.edu</p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-semibold text-navy-900 text-sm">Student Submissions</h3>
              <p className="text-xs text-navy-500">
                Are you an ECE student or faculty member with verified study notes? Submit materials through our portal.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
