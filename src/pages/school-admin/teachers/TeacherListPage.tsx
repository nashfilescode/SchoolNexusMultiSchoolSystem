import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Teacher = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  qualification: string;
};

const fetchTeachers = async () => {
  const { data, error } = await supabase.from('teachers').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const TeacherListPage: React.FC = () => {
  const { data: teachers, isLoading, error } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teacher List</h1>
        <Button asChild>
            <Link to="/school-admin/teachers/add">Add New Teacher</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Qualification</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers?.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{`${teacher.first_name} ${teacher.last_name}`}</TableCell>
              <TableCell>{teacher.phone_number}</TableCell>
              <TableCell>{teacher.qualification}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherListPage;
