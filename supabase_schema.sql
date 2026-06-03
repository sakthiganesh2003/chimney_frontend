-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'technician');
CREATE TYPE booking_status AS ENUM ('pending', 'assigned', 'completed', 'cancelled');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'customer' NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_estimate NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  technician_id UUID REFERENCES public.profiles(id),
  status booking_status DEFAULT 'pending' NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  total_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can view services
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Users can view and edit their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Customers can view their own bookings, admins can view all, technicians can view assigned
CREATE POLICY "View bookings based on role" ON public.bookings FOR SELECT USING (
  customer_id = auth.uid() OR
  technician_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Customers can insert bookings" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Trigger to create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert dummy services
INSERT INTO public.services (name, description, price_estimate, image_url) VALUES 
('Chimney Installation', 'Professional installation of all types of kitchen chimneys.', 150.00, 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'),
('Chimney Uninstallation', 'Safe removal and uninstallation of existing kitchen chimneys.', 80.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'),
('Deep Cleaning', 'Thorough deep cleaning of chimney filters and motor to remove grease.', 100.00, 'https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=800&auto=format&fit=crop'),
('Repair & Maintenance', 'Fixing issues like motor noise, suction problems, and button faults.', 120.00, 'https://images.unsplash.com/photo-1581092921461-7031e4bfb83e?q=80&w=800&auto=format&fit=crop'),
('Inspection & Service', 'General inspection and routine servicing of the chimney unit.', 50.00, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop');
