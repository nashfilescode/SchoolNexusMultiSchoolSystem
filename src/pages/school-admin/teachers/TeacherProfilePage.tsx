import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TeacherProfile = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  address: string | null;
  phone_number: string | null;
  qualification: string | null;
  photo_url: string | null;
};

const fetchTeacherProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const DetailItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
    <div className="mb-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg">{value || 'N/A'}</p>
    </div>
);

const TeacherProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: teacher, isLoading, error } = useQuery<TeacherProfile>({
    queryKey: ['teacherProfile', id],
    queryFn: () => fetchTeacherProfile(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!teacher) return <div>Teacher not found.</div>;

  return (
    <div className="container mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Teacher Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-8">
                <div className="col-span-1 flex flex-col items-center">
                    <Avatar className="w-48 h-48 mb-4">
                        <AvatarImage src={teacher.photo_url || undefined} alt={`${teacher.first_name} ${teacher.last_name}`} />
                        <AvatarFallback>{teacher.first_name?.[0]}{teacher.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                     <h2 className="text-2xl font-semibold">{`${teacher.first_name} ${teacher.last_name}`}</h2>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <DetailItem label="First Name" value={teacher.first_name} />
                    <DetailItem label="Last Name" value={teacher.last_name} />
                    <DetailItem label="Date of Birth" value={new Date(teacher.date_of_birth).toLocaleDateString()} />
                    <DetailItem label="Gender" value={teacher.gender} />
                    <DetailItem label="Phone Number" value={teacher.phone_number} />
                    <DetailItem label="Qualification" value={teacher.qualification} />
                    <DetailItem label="Address" value={teacher.address} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default TeacherProfilePage;
