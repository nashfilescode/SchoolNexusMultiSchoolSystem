import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";

const teacherSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  qualification: z.string().optional(),
  photo: z.instanceof(File).optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

const uploadPhoto = async (photo: File) => {
    const fileName = `${Date.now()}_${photo.name}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, photo);
    if (error) {
        throw new Error(error.message);
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

const AddTeacherPage: React.FC = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (newTeacher: TeacherFormData) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single();
            if (!profile) throw new Error("Profile not found");

            let photo_url: string | undefined = undefined;
            if (newTeacher.photo) {
                photo_url = await uploadPhoto(newTeacher.photo);
            }

            const { photo, ...teacherData } = newTeacher;

            const { error } = await supabase
                .from('teachers')
                .insert([{ ...teacherData, school_id: profile.school_id, photo_url }]);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            toast.success("Teacher added successfully!");
            form.reset();
            setPreview(null);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const form = useForm<TeacherFormData>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: '',
            address: '',
            phone_number: '',
            qualification: '',
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            form.setValue('photo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    function onSubmit(values: TeacherFormData) {
        mutation.mutate(values);
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Add New Teacher</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <FormItem>
                            <FormLabel>Teacher Photo</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                            </FormControl>
                            {preview && <img src={preview} alt="Photo preview" className="mt-4 w-full h-64 object-cover rounded-md" />}
                            {!preview && (
                                <div className="w-full h-64 mt-2 bg-gray-200 border-2 border-dashed rounded-md flex items-center justify-center">
                                    <p className="text-gray-500">Photo Preview</p>
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
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
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="qualification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qualification</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
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
                                {mutation.isPending ? 'Saving...' : 'Add Teacher'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AddTeacherPage;
