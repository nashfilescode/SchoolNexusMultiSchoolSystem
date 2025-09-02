import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";

const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().optional(),
  photo_url: z.string().optional(),
  class_id: z.string().uuid("Please select a class"),
});

type Class = {
  id: string;
  name: string;
};

const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");
    const { data: profile, error } = await supabase.from('profiles').select('school_id').eq('id', user.id).single();
    if (error || !profile) throw new Error("Profile not found");
    return profile;
};

const fetchClasses = async (schoolId: string) => {
    if (!schoolId) return [];
    const { data, error } = await supabase.from('classes').select('id, name').eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    return data;
};

const AddStudentPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
    });

    const schoolId = userProfile?.school_id;

    const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
        queryKey: ['classes', schoolId],
        queryFn: () => fetchClasses(schoolId!),
        enabled: !!schoolId,
    });

    const mutation = useMutation({
        mutationFn: async (newStudent: z.infer<typeof studentSchema>) => {
            if (!schoolId) throw new Error("School ID not found");
            const { data, error } = await supabase
                .from('students')
                .insert([{ ...newStudent, school_id: schoolId }]);

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success("Student added successfully!");
            form.reset();
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const form = useForm<z.infer<typeof studentSchema>>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: '',
            address: '',
        },
    });

    function onSubmit(values: z.infer<typeof studentSchema>) {
        mutation.mutate(values);
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Add New Student</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <div className="w-full h-64 bg-gray-200 border-2 border-dashed rounded-md flex items-center justify-center">
                            <p className="text-gray-500">Photo Upload Placeholder</p>
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="class_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClasses || !schoolId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingClasses ? "Loading classes..." : "Select a class"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Add Student'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AddStudentPage;
