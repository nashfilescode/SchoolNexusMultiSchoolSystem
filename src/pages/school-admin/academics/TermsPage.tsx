import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const termSchema = z.object({
  name: z.string().min(1, "Term name is required"),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  academic_year_id: z.string().uuid("Please select an academic year"),
});

type TermWithYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  academic_year_id: string;
  academic_years: { name: string } | null;
};

type AcademicYear = {
    id: string;
    name: string;
}

const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");
    const { data: profile, error } = await supabase.from('profiles').select('school_id').eq('id', user.id).single();
    if (error || !profile) throw new Error("Profile not found");
    return profile;
};

const fetchTerms = async (schoolId: string) => {
    if (!schoolId) return [];
    const { data, error } = await supabase.from('terms').select('*, academic_years(name)').eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    return data;
};

const fetchAcademicYears = async (schoolId: string) => {
    if (!schoolId) return [];
    const { data, error } = await supabase.from('academic_years').select('id, name').eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    return data;
};

const TermsPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });
  const schoolId = userProfile?.school_id;

  const { data: terms, isLoading: isLoadingTerms, error: termsError } = useQuery<TermWithYear[]>({
    queryKey: ['terms', schoolId],
    queryFn: () => fetchTerms(schoolId!),
    enabled: !!schoolId,
  });

  const { data: academicYears, isLoading: isLoadingAcademicYears } = useQuery<AcademicYear[]>({
    queryKey: ['academic_years', schoolId],
    queryFn: () => fetchAcademicYears(schoolId!),
    enabled: !!schoolId,
  });

  const mutation = useMutation({
    mutationFn: async (newTerm: z.infer<typeof termSchema>) => {
        if (!schoolId) throw new Error("School ID not found");
      const { data, error } = await supabase
        .from('terms')
        .insert([{ ...newTerm, school_id: schoolId }]);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms', schoolId] });
      toast.success("Term added successfully!");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
        toast.error(`Error: ${error.message}`);
    }
  });

  const form = useForm<z.infer<typeof termSchema>>({
    resolver: zodResolver(termSchema),
    defaultValues: { name: '', start_date: '', end_date: '' },
  });

  function onSubmit(values: z.infer<typeof termSchema>) {
    mutation.mutate(values);
  }

  if (isLoadingTerms) return <div>Loading...</div>;
  if (termsError) return <div>Error: {termsError.message}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Terms</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Term</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Term</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="academic_year_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingAcademicYears}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a year" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears?.map(year => <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Term 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Term Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms?.map((term) => (
            <TableRow key={term.id}>
              <TableCell>{term.name}</TableCell>
              <TableCell>{term.academic_years?.name}</TableCell>
              <TableCell>{new Date(term.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(term.end_date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TermsPage;
