const fs = require('fs');
const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
const settingsPanel = lines.slice(1436, 1712).join('\n');
const imports = `import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { MaintenanceSettingsPanel } from '../../MaintenanceMode';
import { Loader2, Check, Settings, Layers, Briefcase, Award, Sparkles, Bell, MessageSquare, User, Type, FileText, Globe, Image, Link, Mail, Upload } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumToggle, PremiumInput } from '../shared/components';

`;
const finalCode = imports + settingsPanel + '\n';
fs.mkdirSync('src/components/admin/panels', {recursive:true});
fs.writeFileSync('src/components/admin/panels/SettingsPanel.jsx', finalCode);
