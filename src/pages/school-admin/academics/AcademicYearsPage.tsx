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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const academicYearSchema = z.object({
  name: z.string().min(1, { message: "Academic year name is required" }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  school_id: string;
};

const fetchAcademicYears = async () => {
  const { data, error } = await supabase.from('academic_years').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const AcademicYearsPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: academicYears, isLoading, error } = useQuery<AcademicYear[]>({
    queryKey: ['academic_years'],
    queryFn: fetchAcademicYears,
  });

  const mutation = useMutation({
    mutationFn: async (newYear: z.infer<typeof academicYearSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single();
      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from('academic_years')
        .insert([{ ...newYear, school_id: profile.school_id }]);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_years'] });
      setDialogOpen(false);
    },
  });

  const form = useForm<z.infer<typeof academicYearSchema>>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
    },
  });

  function onSubmit(values: z.infer<typeof academicYearSchema>) {
    mutation.mutate(values);
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Academic Years</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Academic Year</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Academic Year</DialogTitle>
              <DialogDescription>
                Fill in the details for the new academic year.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: ControllerRenderProps<z.infer<typeof academicYearSchema>, "name"> }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }: { field: ControllerRenderProps<z.infer<typeof academicYearSchema>, "start_date"> }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }: { field: ControllerRenderProps<z.infer<typeof academicYearSchema>, "end_date"> }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {academicYears?.map((year) => (
            <TableRow key={year.id}>
              <TableCell>{year.name}</TableCell>
              <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AcademicYearsPage;
