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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
});

type Class = {
  id: string;
  name: string;
};

const fetchClasses = async (schoolId: string) => {
    if (!schoolId) return [];
    const { data, error } = await supabase.from('classes').select('*').eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    return data;
};

const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");
    const { data: profile, error } = await supabase.from('profiles').select('school_id').eq('id', user.id).single();
    if (error || !profile) throw new Error("Profile not found");
    return profile;
};

const ClassesPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });
  const schoolId = userProfile?.school_id;

  const { data: classes, isLoading, error } = useQuery<Class[]>({
    queryKey: ['classes', schoolId],
    queryFn: () => fetchClasses(schoolId!),
    enabled: !!schoolId,
  });

  const mutation = useMutation({
    mutationFn: async (newClass: z.infer<typeof classSchema>) => {
      if (!schoolId) throw new Error("School ID not found");
      const { data, error } = await supabase
        .from('classes')
        .insert([{ ...newClass, school_id: schoolId }]);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', schoolId] });
      toast.success("Class added successfully!");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
        toast.error(`Error: ${error.message}`);
    }
  });

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: { name: '' },
  });

  function onSubmit(values: z.infer<typeof classSchema>) {
    mutation.mutate(values);
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Classes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., P1" {...field} />
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
            <TableHead>Class Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes?.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassesPage;
