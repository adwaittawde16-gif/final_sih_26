import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CDRSummaryResponse, NetworkGraphResponse, NetworkNode, NetworkEdge } from "@/types";
import { SuspiciousPatternResponse, SuspiciousPattern } from "@/types";