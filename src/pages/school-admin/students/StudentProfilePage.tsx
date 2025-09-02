import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type StudentProfile = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  address: string | null;
  photo_url: string | null;
  classes: { name: string } | null;
};

const fetchStudentProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, classes(name)')
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

const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading, error } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', id],
    queryFn: () => fetchStudentProfile(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div className="container mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-8">
                <div className="col-span-1 flex flex-col items-center">
                    <Avatar className="w-48 h-48 mb-4">
                        <AvatarImage src={student.photo_url || undefined} alt={`${student.first_name} ${student.last_name}`} />
                        <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                     <h2 className="text-2xl font-semibold">{`${student.first_name} ${student.last_name}`}</h2>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <DetailItem label="First Name" value={student.first_name} />
                    <DetailItem label="Last Name" value={student.last_name} />
                    <DetailItem label="Date of Birth" value={new Date(student.date_of_birth).toLocaleDateString()} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Class" value={student.classes?.name} />
                    <DetailItem label="Address" value={student.address} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default StudentProfilePage;
