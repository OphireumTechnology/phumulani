/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Pure Client Notification Service
 * Decouples browser UI components (Header, PortalLayout, NotificationCenterModal) from server persistence/auth internals.
 */

import type { SupportedLanguageCode } from '../types/phase33';
import { authFetch, sessionTokenStore } from './sessionTokenStore';

export type EventClassification =
  | 'PUBLIC'
  | 'MEMBER_PRIVATE'
  | 'STAFF_RESTRICTED'
  | 'FINANCIAL_RESTRICTED'
  | 'SAFEGUARDING_RESTRICTED'
  | 'GOVERNANCE_RESTRICTED';

export type NotificationDeliveryStatus =
  | 'CREATED'
  | 'READY'
  | 'DELIVERED_IN_APP'
  | 'READ'
  | 'ARCHIVED'
  | 'FAILED';

export type AggregateType =
  | 'MEMBER'
  | 'SERVICE_REQUEST'
  | 'PROGRAM'
  | 'WAITLIST'
  | 'VOLUNTEER'
  | 'DONOR'
  | 'GRANT'
  | 'REPORT'
  | 'GOVERNANCE'
  | 'AI_AGENT';

export interface ScopedInAppNotification {
  id: string;
  notificationId: string;
  eventId: string;
  recipientId: string;
  recipientRole: string;
  notificationType: string;
  category: 'MEMBER' | 'CASEWORKER' | 'PROGRAM' | 'VOLUNTEER' | 'DONOR' | 'REPORTING' | 'GOVERNANCE' | 'SECURITY';
  titleKey: string;
  messageKey: string;
  interpolationParams?: Record<string, string | number>;
  relatedEntityType: AggregateType;
  relatedEntityId: string;
  createdAt: string;
  readAt?: string;
  deliveryStatus: NotificationDeliveryStatus;
  confidentialityLevel: EventClassification;
  externalDeliveryStatus: 'BLOCKED_UNAUTHORIZED' | 'STAGED' | 'NOT_CONFIGURED';
}

export interface UserNotificationPreferences {
  id: string;
  userId: string;
  programUpdates: boolean;
  volunteerUpdates: boolean;
  fundraisingCommunications: boolean;
  generalAnnouncements: boolean;
  optionalEngagement: boolean;
  preferredLanguage: SupportedLanguageCode;
  updatedAt: string;
}

const CLIENT_NOTIFICATION_CATALOG: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    'notif.center.title': 'Notification Center',
    'notif.member.registered.title': 'Welcome to Phumulani',
    'notif.member.profile.title': 'Profile Updated',
    'notif.member.preferences.title': 'Notification Preferences Saved',
    'notif.service.submitted.title': 'Service Request Submitted',
    'notif.service.review.title': 'Service Request Under Review',
    'notif.service.assigned.title': 'Caseworker Assigned',
    'notif.service.progress.title': 'Case In Progress',
    'notif.service.resolved.title': 'Service Request Resolved',
    'notif.service.closed.title': 'Service Request Closed',
    'notif.program.applied.title': 'Program Application Received',
    'notif.program.enrolled.title': 'Enrollment Confirmed',
    'notif.program.waitlisted.title': 'Waitlist Placement',
    'notif.program.promoted.title': 'Seat Available: Promoted from Waitlist',
    'notif.program.withdrawn.title': 'Program Enrollment Withdrawn',
    'notif.program.capacity.title': 'Program Capacity Updated',
    'notif.volunteer.applied.title': 'Volunteer Application Received',
    'notif.volunteer.clearance.approved.title': 'Volunteer Clearance Approved',
    'notif.volunteer.clearance.revoked.title': 'Volunteer Clearance Revoked',
    'notif.volunteer.shift.assigned.title': 'New Volunteer Shift Assigned',
    'notif.volunteer.shift.cancelled.title': 'Volunteer Shift Cancelled',
    'notif.volunteer.hours.submitted.title': 'Volunteer Hours Submitted',
    'notif.volunteer.hours.approved.title': 'Volunteer Hours Approved',
    'notif.volunteer.hours.rejected.title': 'Volunteer Hours Rejected',
    'notif.donor.pledge.created.title': 'Pledge Recorded',
    'notif.donor.pledge.updated.title': 'Pledge Updated',
    'notif.grant.review.title': 'Grant Review Requested',
    'notif.grant.approved.title': 'Grant Internal Approval Granted',
    'notif.report.snapshot.title': 'Reporting Snapshot Created',
    'notif.report.review.title': 'Report Executive Review Requested',
    'notif.report.approved.title': 'Report Formally Approved',
    'notif.safeguarding.alert.title': 'Safeguarding Alert',
    'notif.security.violation.title': 'Security Policy Violation',
    'notif.ai.approval.title': 'AI Human Approval Required',
    'notif.ai.halt.title': 'AI Emergency Halt Activated',
    'notif.member.registered.msg': 'Your community member registration has been verified.',
    'notif.member.profile.msg': 'Your member profile information has been successfully updated.',
    'notif.member.preferences.msg': 'Your communication preferences have been updated.',
    'notif.service.submitted.msg': 'Your service request has been received and assigned reference ID.',
    'notif.service.review.msg': 'An authorized intake coordinator is reviewing your service request.',
    'notif.service.assigned.msg': 'A designated caseworker has been assigned to support your case.',
    'notif.service.progress.msg': 'Support actions are underway for your service request.',
    'notif.service.resolved.msg': 'Your service request has been resolved.',
    'notif.service.closed.msg': 'Your service request file has been formally closed.',
    'notif.program.applied.msg': 'Your application has been received and placed into verification.',
    'notif.program.enrolled.msg': 'Your seat has been confirmed for the program.',
    'notif.program.waitlisted.msg': 'You have been placed on the deterministic waitlist at position #{pos}.',
    'notif.program.promoted.msg': 'A confirmed seat has opened for your program application.',
    'notif.program.withdrawn.msg': 'Your enrollment withdrawal has been processed.',
    'notif.program.capacity.msg': 'Operational capacity for the program has been reconfigured.',
    'notif.volunteer.applied.msg': 'Thank you for applying. A volunteer coordinator will review your profile.',
    'notif.volunteer.clearance.approved.msg': 'Your background check and training clearance have been approved.',
    'notif.volunteer.clearance.revoked.msg': 'Your volunteer clearance has been temporarily suspended.',
    'notif.volunteer.shift.assigned.msg': 'You have been scheduled for an upcoming volunteer shift.',
    'notif.volunteer.shift.cancelled.msg': 'An assigned volunteer shift has been cancelled.',
    'notif.volunteer.hours.submitted.msg': 'Your submitted hours are pending authorized supervisor review.',
    'notif.volunteer.hours.approved.msg': 'Your service hours have been verified and added to permanent records.',
    'notif.volunteer.hours.rejected.msg': 'Your volunteer service hours submission could not be verified.',
    'notif.donor.pledge.created.msg': 'Your generous pledge of ${amount} has been recorded. Note: pledge does not represent collected cash.',
    'notif.donor.pledge.updated.msg': 'Your pledge commitment details have been updated.',
    'notif.grant.review.msg': 'A grant proposal requires institutional review before submission.',
    'notif.grant.approved.msg': 'Internal leadership approval granted for the grant proposal.',
    'notif.report.snapshot.msg': 'A tamper-evident reporting snapshot has been recorded.',
    'notif.report.review.msg': 'An operational report requires executive review and authorization.',
    'notif.report.approved.msg': 'The report snapshot has received formal independent sign-off.',
    'notif.safeguarding.alert.msg': 'A confidential safeguarding intake requires immediate designated specialist attention.',
    'notif.security.violation.msg': 'An unauthorized access attempt was detected and rejected.',
    'notif.ai.approval.msg': 'An automated workflow task requires human supervisor authorization.',
    'notif.ai.halt.msg': 'Autonomous AI operations have been halted across all pipelines.',
  },
  so: {
    'notif.center.title': 'Xarunta Ogeysiisyada',
    'notif.member.registered.title': 'Kusoo dhowow Phumulani',
    'notif.member.profile.title': 'Xogta Xubinta La Cusbooneysiiyay',
    'notif.member.preferences.title': 'Dookhyada Ogeysiiska La Keydiyay',
    'notif.service.submitted.title': 'Codsigii Adeegga Waa La Gudbiyay',
    'notif.service.review.title': 'Codsigii Adeegga Waxaa Ku Socota Dib-u-eegis',
    'notif.service.assigned.title': 'Shaqaale Khabiir Ah Ayaa Loo Xilsaaray',
    'notif.service.progress.title': 'Kiiska Ayaa Socda',
    'notif.service.resolved.title': 'Codsigii Adeegga Waa La Xaliyay',
    'notif.service.closed.title': 'Codsigii Adeegga Waa La Xiray',
    'notif.program.applied.title': 'Codsigii Barnaamijka Waa La Helay',
    'notif.program.enrolled.title': 'Diiwaangelinta Waa La Xaqiijiyay',
    'notif.program.waitlisted.title': 'Waxaad Ku Jirtaa Liiska Sugitaanka',
    'notif.program.promoted.title': 'Kursi Bannaan: Laga Qaaday Liiska Sugitaanka',
    'notif.program.withdrawn.title': 'Ka Bixitaanka Barnaamijka Waa La Fuliyay',
    'notif.program.capacity.title': 'Awoodda Barnaamijka La Cusbooneysiiyay',
    'notif.volunteer.applied.title': 'Codsigii Iskaa-wax-u-qabso Waa La Helay',
    'notif.volunteer.clearance.approved.title': 'Oggolaanshaha Iskaa-wax-u-qabsiga Waa La Ansixiyay',
    'notif.volunteer.clearance.revoked.title': 'Oggolaanshaha Iskaa-wax-u-qabsiga Waa La Hakiyay',
    'notif.volunteer.shift.assigned.title': 'Shaqo Cusub Ayaa Laguugu Xilsaaray',
    'notif.volunteer.shift.cancelled.title': 'Shaqadii Waa La Baajiyay',
    'notif.volunteer.hours.submitted.title': 'Saacadaha Shaqada Waa La Gudbiyay',
    'notif.volunteer.hours.approved.title': 'Saacadaha Shaqada Waa La Xaqiijiyay',
    'notif.volunteer.hours.rejected.title': 'Saacadaha Shaqada Lama Ansixin',
    'notif.donor.pledge.created.title': 'Ballanqaadka Waa La Diiwaangeliyay',
    'notif.donor.pledge.updated.title': 'Ballanqaadka La Cusbooneysiiyay',
    'notif.grant.review.title': 'Dib-u-eegista Deeqda Ayaa La Codsaday',
    'notif.grant.approved.title': 'Deeqda Gudaha Waa La Ansixiyay',
    'notif.report.snapshot.title': 'Sawirka Warbixinta Waa La Abuuray',
    'notif.report.review.title': 'Dib-u-eegista Warbixinta Sare La Codsaday',
    'notif.report.approved.title': 'Warbixinta Waa La Ansixiyay',
    'notif.safeguarding.alert.title': 'Digniin Badbaadada Qoyska',
    'notif.security.violation.title': 'Xadgudub Shuruucda Amniga',
    'notif.ai.approval.title': 'Ansixinta Qofka Ayaa Loo Baahan Yahay',
    'notif.ai.halt.title': 'Hakinta Degdegga Ah Ee AI Waa La Shaqaysiiyay',
    'notif.member.registered.msg': 'Diiwaangelintaada xubinimada bulshada waa la xaqiijiyay.',
    'notif.member.profile.msg': 'Xogta profile-kaaga si guul leh ayaa loo cusbooneysiiyay.',
    'notif.member.preferences.msg': 'Dookhyadaada xiriirka waa la keydiyay.',
    'notif.service.submitted.msg': 'Codsigii adeeggaaga waa la helay waxaana loo qoondeeyay lambar tixraac.',
    'notif.service.review.msg': 'Isku-duwaha qaabilaadda ayaa dib u eegaya codsigaaga.',
    'notif.service.assigned.msg': 'Shaqaale u heellan ayaa lagugu xilsaaray.',
    'notif.service.progress.msg': 'Tallaabooyinka lagu caawinayo kiiskaaga ayaa socda.',
    'notif.service.resolved.msg': 'Codsigii adeeggaaga si guul leh ayaa loo xaliyay.',
    'notif.service.closed.msg': 'Kiiskaaga si rasmi ah ayaa loo xiray.',
    'notif.program.applied.msg': 'Codsigii barnaamijkaaga waa la helay.',
    'notif.program.enrolled.msg': 'Kursigaaga barnaamijka waa la xaqiijiyay.',
    'notif.program.waitlisted.msg': 'Waxaad ku jirtaa liiska sugitaanka lambar #{pos}.',
    'notif.program.promoted.msg': 'Kursi ayaa kuu bannaanaaday, waana laguu dallacsiiyay.',
    'notif.program.withdrawn.msg': 'Ka bixitaankaada barnaamijka waa la fuliyay.',
    'notif.program.capacity.msg': 'Awoodda barnaamijka ayaa la hagaajiyay.',
    'notif.volunteer.applied.msg': 'Waad ku mahadsan tahay codsigaaga iskaa-wax-u-qabso.',
    'notif.volunteer.clearance.approved.msg': 'Baaritaankaaga iyo tababarkaaga waa la ansixiyay.',
    'notif.volunteer.clearance.revoked.msg': 'Oggolaanshahaaga shaqo si ku meel gaar ah ayaa loo hakiyay.',
    'notif.volunteer.shift.assigned.msg': 'Waxaa laguugu qoray shaqo iskaa-wax-u-qabso ah.',
    'notif.volunteer.shift.cancelled.msg': 'Shaqadii aad ku qornayd waa la baajiyay.',
    'notif.volunteer.hours.submitted.msg': 'Saacadahaagii waxay sugayaan ansixinta kormeeraha.',
    'notif.volunteer.hours.approved.msg': 'Saacadahaagii shaqada waa la xaqiijiyay oo la keydiyay.',
    'notif.volunteer.hours.rejected.msg': 'Saacadahaagii shaqada lama xaqiijin karin.',
    'notif.donor.pledge.created.msg': 'Ballanqaadkaaga ${amount} waa la diiwaangeliyay.',
    'notif.donor.pledge.updated.msg': 'Faahfaahinta ballanqaadkaaga waa la cusbooneysiiyay.',
    'notif.grant.review.msg': 'Soo jeedinta deeqdu waxay u baahan tahay dib-u-eegis maamul.',
    'notif.grant.approved.msg': 'Ansixinta hoggaanka ee deeqda waa la bixiyay.',
    'notif.report.snapshot.msg': 'Warbixin rasmi ah ayaa la diiwaangeliyay.',
    'notif.report.review.msg': 'Warbixintu waxay u baahan tahay dib-u-eegis fulineed.',
    'notif.report.approved.msg': 'Warbixinta si rasmi ah ayaa loo ansixiyay.',
    'notif.safeguarding.alert.msg': 'Digniin badbaado oo degdeg ah ayaa u baahan feejignaan gaar ah.',
    'notif.security.violation.msg': 'Isku day marin sharci-darro ah ayaa la ogaaday lana diiday.',
    'notif.ai.approval.msg': 'Hawl toos ah waxay u baahan tahay oggolaansho qof.',
    'notif.ai.halt.msg': 'Dhammaan shaqooyinkii AI si degdeg ah ayaa loo hakiyay.',
  },
  es: {
    'notif.center.title': 'Centro de Notificaciones',
    'notif.member.registered.title': 'Bienvenida a Phumulani',
    'notif.member.profile.title': 'Perfil Actualizado',
    'notif.member.preferences.title': 'Preferencias de Notificación Guardadas',
    'notif.service.submitted.title': 'Solicitud de Servicio Recibida',
    'notif.service.review.title': 'Solicitud en Revisión',
    'notif.service.assigned.title': 'Trabajador Social Asignado',
    'notif.service.progress.title': 'Caso en Progreso',
    'notif.service.resolved.title': 'Solicitud Resuelta',
    'notif.service.closed.title': 'Solicitud Cerrada',
    'notif.program.applied.title': 'Solicitud de Programa Recibida',
    'notif.program.enrolled.title': 'Inscripción Confirmada',
    'notif.program.waitlisted.title': 'Colocación en Lista de Espera',
    'notif.program.promoted.title': 'Lugar Disponible: Promovida de Lista',
    'notif.program.withdrawn.title': 'Baja de Programa Confirmada',
    'notif.program.capacity.title': 'Capacidad de Programa Actualizada',
    'notif.volunteer.applied.title': 'Solicitud de Voluntariado Recibida',
    'notif.volunteer.clearance.approved.title': 'Acreditación de Voluntariado Aprobada',
    'notif.volunteer.clearance.revoked.title': 'Acreditación Suspendida',
    'notif.volunteer.shift.assigned.title': 'Nuevo Turno de Voluntariado Asignado',
    'notif.volunteer.shift.cancelled.title': 'Turno de Voluntariado Cancelado',
    'notif.volunteer.hours.submitted.title': 'Horas de Servicio Enviadas',
    'notif.volunteer.hours.approved.title': 'Horas de Servicio Aprobadas',
    'notif.volunteer.hours.rejected.title': 'Horas de Servicio No Verificadas',
    'notif.donor.pledge.created.title': 'Promesa de Donación Registrada',
    'notif.donor.pledge.updated.title': 'Promesa Actualizada',
    'notif.grant.review.title': 'Revisión de Subvención Solicitada',
    'notif.grant.approved.title': 'Aprobación Interna Concedida',
    'notif.report.snapshot.title': 'Captura de Informe Generada',
    'notif.report.review.title': 'Revisión Ejecutiva Solicitada',
    'notif.report.approved.title': 'Informe Formalmente Aprobado',
    'notif.safeguarding.alert.title': 'Alerta de Protección Confidencial',
    'notif.security.violation.title': 'Violación de Política de Seguridad',
    'notif.ai.approval.title': 'Aprobación Humana Requerida',
    'notif.ai.halt.title': 'Parada de Emergencia de IA Activada',
    'notif.member.registered.msg': 'Su registro como miembro de la comunidad ha sido verificado.',
    'notif.member.profile.msg': 'La información de su perfil se actualizó correctamente.',
    'notif.member.preferences.msg': 'Sus preferencias de comunicación han sido guardadas.',
    'notif.service.submitted.msg': 'Su solicitud de servicio fue recibida con código de seguimiento.',
    'notif.service.review.msg': 'Un coordinador autorizado está evaluando su solicitud.',
    'notif.service.assigned.msg': 'Se le ha asignado una trabajadora social dedicada a su caso.',
    'notif.service.progress.msg': 'Las gestiones de apoyo para su solicitud están en marcha.',
    'notif.service.resolved.msg': 'Su solicitud de servicio ha sido resuelta satisfactoriamente.',
    'notif.service.closed.msg': 'El expediente de su solicitud ha sido cerrado formalmente.',
    'notif.program.applied.msg': 'Su solicitud al programa fue recibida y está en proceso.',
    'notif.program.enrolled.msg': 'Su cupo en el programa ha sido confirmado.',
    'notif.program.waitlisted.msg': 'Se le ha ubicado en la lista de espera en la posición #{pos}.',
    'notif.program.promoted.msg': 'Se ha liberado un cupo y su inscripción ha sido activada.',
    'notif.program.withdrawn.msg': 'Su baja voluntaria del programa ha sido completada.',
    'notif.program.capacity.msg': 'La capacidad del programa ha sido actualizada.',
    'notif.volunteer.applied.msg': 'Gracias por su postulación como voluntaria.',
    'notif.volunteer.clearance.approved.msg': 'Su verificación de antecedentes y capacitación han sido aprobadas.',
    'notif.volunteer.clearance.revoked.msg': 'Su acreditación de voluntaria ha sido temporalmente suspendida.',
    'notif.volunteer.shift.assigned.msg': 'Se le ha programado un nuevo turno de voluntariado.',
    'notif.volunteer.shift.cancelled.msg': 'Un turno asignado ha sido cancelado.',
    'notif.volunteer.hours.submitted.msg': 'Sus horas enviadas están pendientes de revisión por supervisión.',
    'notif.volunteer.hours.approved.msg': 'Sus horas de servicio han sido verificadas y registradas.',
    'notif.volunteer.hours.rejected.msg': 'Sus horas enviadas no pudieron ser verificadas.',
    'notif.donor.pledge.created.msg': 'Su compromiso de donación por ${amount} ha sido registrado.',
    'notif.donor.pledge.updated.msg': 'Los detalles de su promesa han sido actualizados.',
    'notif.grant.review.msg': 'Una propuesta de subvención requiere revisión institucional.',
    'notif.grant.approved.msg': 'Aprobación interna de liderazgo concedida a la subvención.',
    'notif.report.snapshot.msg': 'Una captura inmutable de informes ha sido generada.',
    'notif.report.review.msg': 'Un informe operativo requiere revisión por la dirección ejecutiva.',
    'notif.report.approved.msg': 'El informe ha recibido aprobación formal independiente.',
    'notif.safeguarding.alert.msg': 'Una atención confidencial de protección requiere especialista asignado.',
    'notif.security.violation.msg': 'Se detectó y bloqueó un intento de acceso no autorizado.',
    'notif.ai.approval.msg': 'Una tarea automatizada requiere aprobación de un supervisor humano.',
    'notif.ai.halt.msg': 'Las operaciones autónomas de IA han sido detenidas de inmediato.',
  },
  hmn: {
    'notif.center.title': 'Chaw Qhia Xov Xwm',
    'notif.member.registered.title': 'Zoo Siab Txais Tos Rau Phumulani',
    'notif.member.profile.title': 'Koj Cov Ntaub Ntawv Hloov Lawm',
    'notif.member.preferences.title': 'Xaiv Txoj Kev Sib Tham Lawm',
    'notif.service.submitted.title': 'Kev Thov Pab Xa Lawm',
    'notif.service.review.title': 'Kev Thov Pab Tab Tom Saib Xyuas',
    'notif.service.assigned.title': 'Muab Tus Neeg Pab Koj Lawm',
    'notif.service.progress.title': 'Kev Pab Tab Tom Ua',
    'notif.service.resolved.title': 'Kev Pab Tau Ua Tiav Lawm',
    'notif.service.closed.title': 'Kev Thov Pab Kaw Lawm',
    'notif.program.applied.title': 'Daim Ntawv Thov Kawm Tau Txais Lawm',
    'notif.program.enrolled.title': 'Koj Tau Txais Chaw Kawm Lawm',
    'notif.program.waitlisted.title': 'Nyob Rau Hauv Daim Ntawv Tos',
    'notif.program.promoted.title': 'Muaj Chaw: Tau Txais Chaw Lawm',
    'notif.program.withdrawn.title': 'Thim Ntawv Kawm Lawm',
    'notif.program.capacity.title': 'Chaw Kawm Hloov Lawm',
    'notif.volunteer.applied.title': 'Daim Ntawv Pab Dawb Tau Txais Lawm',
    'notif.volunteer.clearance.approved.title': 'Kev Pom Zoo Pab Dawb Dhau Lawm',
    'notif.volunteer.clearance.revoked.title': 'Kev Pab Dawb Raug Nres',
    'notif.volunteer.shift.assigned.title': 'Muaj Lub Sij Hawm Pab Dawb Tshiab',
    'notif.volunteer.shift.cancelled.title': 'Lub Sij Hawm Pab Dawb Raug Tso Tseg',
    'notif.volunteer.hours.submitted.title': 'Cov Sij Hawm Xa Lawm',
    'notif.volunteer.hours.approved.title': 'Cov Sij Hawm Pom Zoo Lawm',
    'notif.volunteer.hours.rejected.title': 'Cov Sij Hawm Tsis Pom Zoo',
    'notif.donor.pledge.created.title': 'Kev Pab Nyiaj Sau Lawm',
    'notif.donor.pledge.updated.title': 'Kev Pab Nyiaj Hloov Lawm',
    'notif.grant.review.title': 'Xav Kom Saib Xyuas Nyiaj Pab',
    'notif.grant.approved.title': 'Nyiaj Pab Pom Zoo Lawm',
    'notif.report.snapshot.title': 'Daim Ntawv Qhia Tau Sau Lawm',
    'notif.report.review.title': 'Xav Kom Saib Daim Ntawv Qhia',
    'notif.report.approved.title': 'Daim Ntawv Qhia Pom Zoo Lawm',
    'notif.safeguarding.alert.title': 'Ceeb Toom Kev Nyab Xeeb',
    'notif.security.violation.title': 'Kev Ruaj Ntseg Txhaum Cai',
    'notif.ai.approval.title': 'Xav Kom Neeg Pom Zoo',
    'notif.ai.halt.title': 'Nres AI Kev Ua Haujlwm',
    'notif.member.registered.msg': 'Koj txoj kev tso npe hauv zej zog tau txais lawm.',
    'notif.member.profile.msg': 'Koj cov ntaub ntawv tau hloov kho tiav lawm.',
    'notif.member.preferences.msg': 'Koj cov kev xaiv tau muab sau tseg cia lawm.',
    'notif.service.submitted.msg': 'Koj daim ntawv thov tau txais lawm.',
    'notif.service.review.msg': 'Tus neeg ua haujlwm tab tom tshawb xyuas koj qhov teeb meem.',
    'notif.service.assigned.msg': 'Muaj tus neeg saib xyuas tau txais los pab koj.',
    'notif.service.progress.msg': 'Kev pab koj tab tom ua haujlwm lawm.',
    'notif.service.resolved.msg': 'Qhov teeb meem koj thov tau daws tiav lawm.',
    'notif.service.closed.msg': 'Koj cov ntaub ntawv thov pab tau raug kaw lawm.',
    'notif.program.applied.msg': 'Koj daim ntawv thov kawm tau txais lawm.',
    'notif.program.enrolled.msg': 'Koj tau txais chaw hauv chav kawm lawm.',
    'notif.program.waitlisted.msg': 'Koj nyob ntawm kab tos tus zauv #{pos}.',
    'notif.program.promoted.msg': 'Muaj chaw rau koj lawm, koj tau nkag kawm.',
    'notif.program.withdrawn.msg': 'Kev tshem npe tawm tau ua tiav lawm.',
    'notif.program.capacity.msg': 'Chaw kawm muaj peev xwm tau hloov kho lawm.',
    'notif.volunteer.applied.msg': 'Ua tsaug rau koj txoj kev thov pab dawb.',
    'notif.volunteer.clearance.approved.msg': 'Koj daim ntawv kuaj keeb kwm tau pom zoo lawm.',
    'notif.volunteer.clearance.revoked.msg': 'Koj txoj haujlwm pab dawb raug tso tseg ib ntus.',
    'notif.volunteer.shift.assigned.msg': 'Koj muaj sijhawm tuaj pab dawb tshiab.',
    'notif.volunteer.shift.cancelled.msg': 'Lub sijhawm koj yuav tuaj tau raug tso tseg.',
    'notif.volunteer.hours.submitted.msg': 'Cov sijhawm koj xa tab tom tos kev pom zoo.',
    'notif.volunteer.hours.approved.msg': 'Koj cov sijhawm tau muab sau tseg rau hauv ntaub ntawv lawm.',
    'notif.volunteer.hours.rejected.msg': 'Koj cov sijhawm tsis tau txais kev pom zoo.',
    'notif.donor.pledge.created.msg': 'Koj cov lus cog tseg $${amount} tau muab sau tseg lawm.',
    'notif.donor.pledge.updated.msg': 'Cov ntaub ntawv cog tseg tau muab kho tshiab lawm.',
    'notif.grant.review.msg': 'Daim ntawv thov nyiaj xav tau kev soj ntsuam.',
    'notif.grant.approved.msg': 'Cov thawj coj tau pom zoo daim ntawv thov nyiaj lawm.',
    'notif.report.snapshot.msg': 'Daim duab qhia kev ua haujlwm tau raug sau cia.',
    'notif.report.review.msg': 'Cov thawj coj yuav tsum tshuaj xyuas daim ntawv qhia.',
    'notif.report.approved.msg': 'Daim ntawv qhia tau txais kev pom zoo tas nrho lawm.',
    'notif.safeguarding.alert.msg': 'Muaj xwm txheej ceev xav tau kev saib xyuas ntiag tug.',
    'notif.security.violation.msg': 'Muaj neeg sim nkag tsis raug cai thiab raug txwv.',
    'notif.ai.approval.msg': 'Haujlwm xav tau neeg tso cai ua ntej.',
    'notif.ai.halt.msg': 'Txhua yam AI kev ua haujlwm tau raug nres tam sim.',
  },
  kar: {
    'notif.center.title': 'တၢ်ဟ့ၣ်သ့ၣ်ညါအလီၢ်',
    'notif.member.registered.title': 'တၢ်တူၢ်လိာ်ဆူ Phumulani',
    'notif.member.profile.title': 'ပှၤနီၢ်ကစၢ်တၢ်ဂ့ၢ်ဘီဘါ တၢ်မၤသီထီၣ်ကဒါက့ၤ',
    'notif.member.preferences.title': 'တၢ်ဆိကမိၣ်တၢ်ဟ့ၣ်သ့ၣ်ညါ တၢ်ပာ်ကဲထီၣ်',
    'notif.service.submitted.title': 'တၢ်ဃ့တၢ်မၤစၢၤ တၢ်ဟ့ၣ်ထီၣ်တ့ၢ်လံ',
    'notif.service.review.title': 'တၢ်ဃ့တၢ်မၤစၢၤ ကွၢ်ဆိကမိၣ်ကဒါက့ၤဝံၤ',
    'notif.service.assigned.title': 'ပှၤမၤတၢ်ဖိ တၢ်ဟ့ၣ်လီၤလံ',
    'notif.service.progress.title': 'တၢ်မၤစၢၤ တၢ်မၤအိၣ်ဒံး',
    'notif.service.resolved.title': 'တၢ်ဃ့တၢ်မၤစၢၤ တၢ်မၤဘျါက့ၤလံ',
    'notif.service.closed.title': 'တၢ်ဃ့တၢ်မၤစၢၤ ပာ်ကပူၤလံ',
    'notif.program.applied.title': 'တၢ်ရဲၣ်တၢ်ကျဲၤ တၢ်ဃ့နုာ် တူၢ်လိာ်လံ',
    'notif.program.enrolled.title': 'တၢ်မံၤစရီ ပာ်ဂၢၢ်ပာ်ကျၢၤလံ',
    'notif.program.waitlisted.title': 'အိၣ်လၢတၢ်အိၣ်ခိးစရီပူၤ',
    'notif.program.promoted.title': 'လီၢ်အိၣ် - တၢ်ဒိးန့ၢ်လီၢ်လံ',
    'notif.program.withdrawn.title': 'တၢ်ဟးထီၣ်ကွံာ် တၢ်ပာ်ပနီၣ်',
    'notif.program.capacity.title': 'တၢ်ရဲၣ်တၢ်ကျဲၤ အနီၣ်ဂံၢ် မၤသီထီၣ်လံ',
    'notif.volunteer.applied.title': 'တၢ်ဃ့မၤစၢၤတၢ် တူၢ်လိာ်လံ',
    'notif.volunteer.clearance.approved.title': 'တၢ်ပျဲမၤစၢၤတၢ် အဘျုးအဖှိၣ် ပာ်ဂၢၢ်လံ',
    'notif.volunteer.clearance.revoked.title': 'တၢ်ပျဲမၤစၢၤတၢ် ပာ်ပတုာ်တၢ်ဆၢကတီၢ်',
    'notif.volunteer.shift.assigned.title': 'တၢ်မၤစၢၤအကတီၢ်သီ တၢ်ဟ့ၣ်လီၤလံ',
    'notif.volunteer.shift.cancelled.title': 'တၢ်မၤစၢၤအကတီၢ် တၢ်ပာ်ကပူၤလံ',
    'notif.volunteer.hours.submitted.title': 'နၣ်ရံၣ်ဟ့ၣ်ထီၣ်လံ',
    'notif.volunteer.hours.approved.title': 'နၣ်ရံၣ်ပာ်ဂၢၢ်လံ',
    'notif.volunteer.hours.rejected.title': 'နၣ်ရံၣ်တၢ်တပာ်ဂၢၢ်ဘၣ်',
    'notif.donor.pledge.created.title': 'တၢ်ဟ့ၣ်မၤစၢၤစ့ တၢ်ပာ်ပနီၣ်လံ',
    'notif.donor.pledge.updated.title': 'တၢ်ဟ့ၣ်စ့ မၤသီထီၣ်လံ',
    'notif.grant.review.title': 'တၢ်မၤစၢၤစ့ တၢ်ကွၢ်ဆိကမိၣ်ကဒါက့ၤ',
    'notif.grant.approved.title': 'တၢ်မၤစၢၤစ့ အပူၤတၢ်ပာ်ဂၢၢ်လံ',
    'notif.report.snapshot.title': 'တၢ်ပာ်ဖျါလံာ်လဲၢ် တၢ်ပာ်ကဲထီၣ်လံ',
    'notif.report.review.title': 'တၢ်ပာ်ဖျါ ပှၤပၢတၢ်ကွၢ်ဆိကမိၣ်',
    'notif.report.approved.title': 'တၢ်ပာ်ဖျါ ပာ်ဂၢၢ်လံ',
    'notif.safeguarding.alert.title': 'တၢ်ဒီသဒိၣ်တၢ်ဘံၣ်တၢ်ဘၢ ကလုၢ်ဟ့ၣ်ပလီၢ်',
    'notif.security.violation.title': 'တၢ်ဘံၣ်တၢ်ဘၢသဲးစး တၢ်မၤကမၣ်',
    'notif.ai.approval.title': 'ပှၤနီၢ်ကစၢ် တၢ်ပာ်ဂၢၢ်လိၣ်ဘၣ်',
    'notif.ai.halt.title': 'AI တၢ်မၤ တၢ်ပာ်ပတုာ်ဆိအိၣ်တုၤလီၤ',
    'notif.member.registered.msg': 'နတၢ်နုာ်လီၤမၤပှၤတၢ်ဖိ ပာ်ဂၢၢ်ပာ်ကျၢၤလံ.',
    'notif.member.profile.msg': 'နတၢ်ဂ့ၢ်တၢ်ကျိၤ တၢ်မၤသီထီၣ်ဝံၤလံ.',
    'notif.member.preferences.msg': 'နတၢ်ဃုထၢ တၢ်ပာ်ကဲထီၣ်ဝံၤလံ.',
    'notif.service.submitted.msg': 'နတၢ်ဃ့တၢ်မၤစၢၤ တူၢ်လိာ်လံ ဒီးဒိးန့ၢ်လံာ်နီၣ်ဂံၢ်လံ.',
    'notif.service.review.msg': 'ပှၤကွၢ်ဆိကမိၣ်တၢ်ဖိ ကွၢ်ဒံးနတၢ်ဃ့လံ.',
    'notif.service.assigned.msg': 'ပှၤမၤစၢၤတၢ်ဖိ ဒိးန့ၢ်လံ ဒ်သိးကမၤစၢၤနၤ.',
    'notif.service.progress.msg': 'တၢ်မၤစၢၤဒ်အကြၢးန့ၣ် မၤအိၣ်ဒံး.',
    'notif.service.resolved.msg': 'နတၢ်ဃ့တၢ်မၤစၢၤ ဘျါက့ၤဝံၤလံ.',
    'notif.service.closed.msg': 'နတၢ်ဃ့လံာ်ပာ်ကပူၤဝံၤလံ.',
    'notif.program.applied.msg': 'နတၢ်ဃ့နုာ် တူၢ်လိာ်လံ.',
    'notif.program.enrolled.msg': 'နလီၢ်ပာ်ဂၢၢ်ပာ်ကျၢၤလံ.',
    'notif.program.waitlisted.msg': 'နအိၣ်လၢတၢ်အိၣ်ခိးစရီနီၣ်ဂံၢ် #{pos}.',
    'notif.program.promoted.msg': 'လီၢ်အိၣ်ဒီး နဒိးန့ၢ်လီၢ်လံ.',
    'notif.program.withdrawn.msg': 'နတၢ်ဟးထီၣ်ကွံာ် တၢ်ပာ်ပနီၣ်လံ.',
    'notif.program.capacity.msg': 'တၢ်ရဲၣ်တၢ်ကျဲၤအနီၣ်ဂံၢ် မၤသီထီၣ်လံ.',
    'notif.volunteer.applied.msg': 'ဘျုးဒိၣ်မးလၢ နတၢ်ဃ့မၤစၢၤတၢ်အဃိ.',
    'notif.volunteer.clearance.approved.msg': 'နတၢ်မၤစၢၤတၢ် အခွဲးတူၢ်လိာ်လံ.',
    'notif.volunteer.clearance.revoked.msg': 'နတၢ်မၤစၢၤအခွဲး ပာ်ပတုာ်ဆိအိၣ်.',
    'notif.volunteer.shift.assigned.msg': 'နတၢ်မၤဆၢကတီၢ်သီ အိၣ်လံ.',
    'notif.volunteer.shift.cancelled.msg': 'နတၢ်မၤဆၢကတီၢ် ပာ်ကပူၤလံ.',
    'notif.volunteer.hours.submitted.msg': 'နနၣ်ရံၣ်အိၣ်ခိးပှၤပၢတၢ်တၢ်ပာ်ဂၢၢ်.',
    'notif.volunteer.hours.approved.msg': 'နနၣ်ရံၣ်ပာ်ဂၢၢ် ဒီးပာ်ပနီၣ်လံ.',
    'notif.volunteer.hours.rejected.msg': 'နနၣ်ရံၣ် တသ့ပာ်ဂၢၢ်ဘၣ်.',
    'notif.donor.pledge.created.msg': 'နတၢ်ဟ့ၣ်စ့ $${amount} ပာ်ပနီၣ်လံ.',
    'notif.donor.pledge.updated.msg': 'နတၢ်ဟ့ၣ်စ့တၢ်ဂ့ၢ် မၤသီထီၣ်လံ.',
    'notif.grant.review.msg': 'စ့မၤစၢၤတၢ်ရဲၣ်တၢ်ကျဲၤ လိၣ်ဘၣ်တၢ်ကွၢ်ဆိကမိၣ်.',
    'notif.grant.approved.msg': 'ခိၣ်နၢ်တဖၣ် ပာ်ဂၢၢ်လံ.',
    'notif.report.snapshot.msg': 'တၢ်ပာ်ဖျါလံာ်လဲၢ် ပာ်ပနီၣ်လံ.',
    'notif.report.review.msg': 'တၢ်ပာ်ဖျါ လိၣ်ဘၣ်ပှၤပၢတၢ်ကွၢ်ဆိကမိၣ်.',
    'notif.report.approved.msg': 'တၢ်ပာ်ဖျါ ဒိးန့ၢ်တၢ်ပာ်ဂၢၢ်လံ.',
    'notif.safeguarding.alert.msg': 'တၢ်ဘံၣ်တၢ်ဘၢတၢ်ဂ့ၢ် အိၣ်လိၣ်ဘၣ်ပှၤကွၢ်ဆိကမိၣ်.',
    'notif.security.violation.msg': 'တၢ်မၤကမၣ်အိၣ်ဒီး တၢ်ဆိကမိၣ်ပတုာ်လံ.',
    'notif.ai.approval.msg': 'တၢ်မၤတခါ လိၣ်ဘၣ်ပှၤဟ့ၣ်အခွဲး.',
    'notif.ai.halt.msg': 'AI တၢ်မၤခဲလၢာ် တၢ်ပာ်ပတုာ်လံ.',
  },
  orm: {
    'notif.center.title': 'Giddugala Beeksisa',
    'notif.member.registered.title': 'Baga Nagaan Gara Phumulani Dhuftan',
    'notif.member.profile.title': 'Odeeffannoo Miseensaa Haaromfameera',
    'notif.member.preferences.title': 'Filannoowwan Beeksisaa Olkaawwameera',
    'notif.service.submitted.title': 'Iyyannoon Tajaajilaa Dhiyaateera',
    'notif.service.review.title': 'Iyyannoon Tajaajilaa Ilaalamaa Jira',
    'notif.service.assigned.title': 'Hojjetaan Hawaasaa Ramadameera',
    'notif.service.progress.title': 'Dhimmi Adeemsarra Jira',
    'notif.service.resolved.title': 'Iyyannoon Tajaajilaa Furmaata Argateera',
    'notif.service.closed.title': 'Iyyannoon Tajaajilaa Cufameera',
    'notif.program.applied.title': 'Iyyannoon Sagantaa Fudhatameera',
    'notif.program.enrolled.title': 'Galmeen Mirkanaa\'eera',
    'notif.program.waitlisted.title': 'Tarree Eeggataa Keessa Jira',
    'notif.program.promoted.title': 'Bakki Banameera: Tarree Eeggataarraa Dabarameera',
    'notif.program.withdrawn.title': 'Saganticha Keessaa Bahuun Mirkanaa\'eera',
    'notif.program.capacity.title': 'Humni Sagantichaa Haaromfameera',
    'notif.volunteer.applied.title': 'Iyyannoon Tole-oltummaa Fudhatameera',
    'notif.volunteer.clearance.approved.title': 'Hayyamni Tole-oltummaa Mirkanaa\'eera',
    'notif.volunteer.clearance.revoked.title': 'Hayyamni Tole-oltummaa Yeroof Dhorkameera',
    'notif.volunteer.shift.assigned.title': 'Hojiin Tole-oltummaa Haaraan Ramadameera',
    'notif.volunteer.shift.cancelled.title': 'Hojiin Tole-oltummaa Haqameera',
    'notif.volunteer.hours.submitted.title': 'Sa\'aatiin Hojii Dhiyaateera',
    'notif.volunteer.hours.approved.title': 'Sa\'aatiin Hojii Mirkanaa\'eera',
    'notif.volunteer.hours.rejected.title': 'Sa\'aatiin Hojii Hin Mirkanoofne',
    'notif.donor.pledge.created.title': 'Waadaan Arjoomaa Galmaa\'eera',
    'notif.donor.pledge.updated.title': 'Waadaan Arjoomaa Haaromfameera',
    'notif.grant.review.title': 'Iyyannoon Gargaarsaa Ilaalcha Gaafata',
    'notif.grant.approved.title': 'Gargaarsi Keessaa Mirkanaa\'eera',
    'notif.report.snapshot.title': 'Gabaasni Galmaa\'ee Qabameera',
    'notif.report.review.title': 'Gabaasni Hoggansaan Ilaalama',
    'notif.report.approved.title': 'Gabaasni Guutummaatti Mirkanaa\'eera',
    'notif.safeguarding.alert.title': 'Akeekkachiisa Eegumsa Nageenyaa',
    'notif.security.violation.title': 'Seera Nageenyaa Cabsuu',
    'notif.ai.approval.title': 'Eeyyama Namaa Barbaada',
    'notif.ai.halt.title': 'Hojiin AI Hatattamaan Dhaabateera',
    'notif.member.registered.msg': 'Galmeen miseensummaa hawaasa keessan mirkanaa\'eera.',
    'notif.member.profile.msg': 'Odeeffannoon keessan milkaa\'inaan haaromfameera.',
    'notif.member.preferences.msg': 'Filannoowwan qunnamtii keessanii qabamaniiru.',
    'notif.service.submitted.msg': 'Iyyannoon keessan lakkoofsa eeyyamaa waliin qabameera.',
    'notif.service.review.msg': 'Hojjetaan iyyannoo keessan gamaaggamaa jira.',
    'notif.service.assigned.msg': 'Hojjetaan isin gargaaru ramadameera.',
    'notif.service.progress.msg': 'Tarkaanfiiwwan deeggarsaa adeemsarra jiru.',
    'notif.service.resolved.msg': 'Iyyannoon keessan furmaata argateera.',
    'notif.service.closed.msg': 'Galmeen dhimma keessanii cufameera.',
    'notif.program.applied.msg': 'Iyyannoon sagantichaa fudhatameera.',
    'notif.program.enrolled.msg': 'Bakki saganticha keessaa mirkanaa\'eera.',
    'notif.program.waitlisted.msg': 'Tarree eeggataa keessa lakkoofsa #{pos} irra jirtu.',
    'notif.program.promoted.msg': 'Bakki waan banameef saganticha keessatti dabalataniirtu.',
    'notif.program.withdrawn.msg': 'Saganticha keessaa bahuun keessan raawwateera.',
    'notif.program.capacity.msg': 'Humni sagantichaa haaromfameera.',
    'notif.volunteer.applied.msg': 'Tole-oltummaan waan iyyattaniif galatoomaa.',
    'notif.volunteer.clearance.approved.msg': 'Qorannoo fi leenjiin keessan mirkanaa\'eera.',
    'notif.volunteer.clearance.revoked.msg': 'Hayyamni keessan yeroof dhaabbateera.',
    'notif.volunteer.shift.assigned.msg': 'Hojiin tole-oltummaa haaraan isiniif ramadameera.',
    'notif.volunteer.shift.cancelled.msg': 'Ramaddiin hojii haqameera.',
    'notif.volunteer.hours.submitted.msg': 'Sa\'aatiin hojii gamaaggama eeggataa jira.',
    'notif.volunteer.hours.approved.msg': 'Sa\'aatiin hojii mirkanaa\'ee galmaa\'eera.',
    'notif.volunteer.hours.rejected.msg': 'Sa\'aatiin dhiyaate mirkanaa\'uu hin dandeenye.',
    'notif.donor.pledge.created.msg': 'Waadaan arjooma keessanii $${amount} galmaa\'eera.',
    'notif.donor.pledge.updated.msg': 'Odeeffannoon waadaa keessanii haaromfameera.',
    'notif.grant.review.msg': 'Iyyannoon gargaarsaa ilaalcha hoggansaa barbaada.',
    'notif.grant.approved.msg': 'Hoggansi iyyannoo gargaarsaa mirkaneesseera.',
    'notif.report.snapshot.msg': 'Gabaasni yeroo ammaa qabameera.',
    'notif.report.review.msg': 'Gabaasni hoggansaan ilaalamuu qaba.',
    'notif.report.approved.msg': 'Gabaasni guutummaatti mirkanaa\'eera.',
    'notif.safeguarding.alert.msg': 'Dhimmi eegumsa icciitii hatattama barbaada.',
    'notif.security.violation.msg': 'Yaaliin hayyama hin qabne dhaabateera.',
    'notif.ai.approval.msg': 'Hojiin kun hayyama namaa barbaada.',
    'notif.ai.halt.msg': 'Hojiin AI hunduu hatattamaan dhaabbateera.',
  },
  am: {
    'notif.center.title': 'የማሳወቂያ ማዕከል',
    'notif.member.registered.title': 'ወደ ፉሙላኒ እንኳን በደህና መጡ',
    'notif.member.profile.title': 'የአባልነት መረጃ ታድሷል',
    'notif.member.preferences.title': 'የማሳወቂያ ምርጫዎች ተቀምጠዋል',
    'notif.service.submitted.title': 'የአገልግሎት ጥያቄ ቀርቧል',
    'notif.service.review.title': 'የአገልግሎት ጥያቄ በመገምገም ላይ ነው',
    'notif.service.assigned.title': 'የማህበረሰብ ሰራተኛ ተመድቧል',
    'notif.service.progress.title': 'ጉዳዩ በሂደት ላይ ነው',
    'notif.service.resolved.title': 'የአገልግሎት ጥያቄው መፍትሄ አግኝቷል',
    'notif.service.closed.title': 'የአገልግሎት ጥያቄው ተዘግቷል',
    'notif.program.applied.title': 'የፕሮግራም ማመልከቻ ደርሷል',
    'notif.program.enrolled.title': 'ምዝገባው ተረጋግጧል',
    'notif.program.waitlisted.title': 'በተጠባባቂ ዝርዝር ውስጥ ተቀምጠዋል',
    'notif.program.promoted.title': 'ቦታ ተገኝቷል፡ ከተጠባባቂ ዝርዝር አልፈዋል',
    'notif.program.withdrawn.title': 'ከፕሮግራም መውጣት ተረጋግጧል',
    'notif.program.capacity.title': 'የፕሮግራሙ የመቀበል አቅም ታድሷል',
    'notif.volunteer.applied.title': 'የበጎ ፈቃድ ማመልከቻ ደርሷል',
    'notif.volunteer.clearance.approved.title': 'የበጎ ፈቃደኝነት ፍቃድ ጸድቋል',
    'notif.volunteer.clearance.revoked.title': 'የበጎ ፈቃደኝነት ፍቃድ ለጊዜው ታግዷል',
    'notif.volunteer.shift.assigned.title': 'አዲስ የበጎ ፈቃድ ተራ ተመድቧል',
    'notif.volunteer.shift.cancelled.title': 'የበጎ ፈቃድ ተራው ተሰርዟል',
    'notif.volunteer.hours.submitted.title': 'የስራ ሰዓታት ቀርበዋል',
    'notif.volunteer.hours.approved.title': 'የስራ ሰዓታት ጸድቀዋል',
    'notif.volunteer.hours.rejected.title': 'የስራ ሰዓታቱ አልተረጋገጡም',
    'notif.donor.pledge.created.title': 'የልገሳ ቃል ተመዝግቧል',
    'notif.donor.pledge.updated.title': 'የልገሳ ቃል መረጃ ታድሷል',
    'notif.grant.review.title': 'የዕርዳታ ጥያቄ ግምገማ ይጠይቃል',
    'notif.grant.approved.title': 'የዕርዳታ ጥያቄ ውስጣዊ ይሁንታ አግኝቷል',
    'notif.report.snapshot.title': 'የሪፖርት መዝገብ ተይዟል',
    'notif.report.review.title': 'የስራ አስፈፃሚ ግምገማ ይጠይቃል',
    'notif.report.approved.title': 'ሪፖርቱ በይፋ ጸድቋል',
    'notif.safeguarding.alert.title': 'የጥበቃ እና ደህንነት ማስጠንቀቂያ',
    'notif.security.violation.title': 'የደህንነት ደንብ ጥሰት',
    'notif.ai.approval.title': 'የሰው ይሁንታ ያስፈልጋል',
    'notif.ai.halt.title': 'የአርቴፊሻል ኢንተለጀንስ አስቸኳይ ማቆሚያ ተጀምሯል',
    'notif.member.registered.msg': 'የማህበረሰብ አባልነት ምዝገባዎ ተረጋግጧል።',
    'notif.member.profile.msg': 'የመገለጫ መረጃዎ በተሳካ ሁኔታ ታድሷል።',
    'notif.member.preferences.msg': 'የመገናኛ ምርጫዎችዎ ተቀምጠዋል።',
    'notif.service.submitted.msg': 'የአገልግሎት ጥያቄዎ ከመለያ ቁጥር ጋር ተመዝግቧል።',
    'notif.service.review.msg': 'ባለሙያ ጥያቄዎን በመገምገም ላይ ነው።',
    'notif.service.assigned.msg': 'እርስዎን የሚረዳ ሰራተኛ ተመድቧል።',
    'notif.service.progress.msg': 'የድጋፍ እርምጃዎች እየተከናወኑ ነው።',
    'notif.service.resolved.msg': 'የአገልግሎት ጥያቄዎ በተሳካ ሁኔታ ተፈቷል።',
    'notif.service.closed.msg': 'የጉዳይ ፋይልዎ በይፋ ተዘግቷል።',
    'notif.program.applied.msg': 'የፕሮግራም ማመልከቻዎ ተቀባይነት አግኝቷል።',
    'notif.program.enrolled.msg': 'በፕሮግራሙ ውስጥ ያለዎት ቦታ ተረጋግጧል።',
    'notif.program.waitlisted.msg': 'በተጠባባቂ ዝርዝር ቁጥር #{pos} ላይ ተቀምጠዋል።',
    'notif.program.promoted.msg': 'ክፍት ቦታ ስለተገኘ ወደ ፕሮግራሙ ገብተዋል።',
    'notif.program.withdrawn.msg': 'ከፕሮግራም የመውጣት ጥያቄዎ ተፈፅሟል።',
    'notif.program.capacity.msg': 'የፕሮግራሙ አቅም ታድሷል።',
    'notif.volunteer.applied.msg': 'በበጎ ፈቃደኝነት ስላመለከቱ እናመሰግናለን።',
    'notif.volunteer.clearance.approved.msg': 'የጀርባ ምርመራ እና ስልጠናዎ ጸድቋል።',
    'notif.volunteer.clearance.revoked.msg': 'የበጎ ፈቃድ ፍቃድዎ ለጊዜው ታግዷል።',
    'notif.volunteer.shift.assigned.msg': 'አዲስ የበጎ ፈቃድ የስራ ሰዓት ተመድቦልዎታል።',
    'notif.volunteer.shift.cancelled.msg': 'የተመደበው የስራ ሰዓት ተሰርዟል።',
    'notif.volunteer.hours.submitted.msg': 'ያስገቡት ሰዓት የኃላፊውን ይሁንታ በመጠበቅ ላይ ነው።',
    'notif.volunteer.hours.approved.msg': 'የስራ ሰዓትዎ ጸድቆ በመዝገብ ላይ ገብቷል።',
    'notif.volunteer.hours.rejected.msg': 'ያስገቡት ሰዓት ሊረጋገጥ አልቻለም።',
    'notif.donor.pledge.created.msg': 'የ$${amount} የልገሳ ቃልዎ ተመዝግቧል።',
    'notif.donor.pledge.updated.msg': 'የልገሳ ቃል መረጃዎ ታድሷል።',
    'notif.grant.review.msg': 'የዕርዳታ ጥያቄው የተቋማዊ ግምገማ ይጠይቃል።',
    'notif.grant.approved.msg': 'የአመራር ውስጣዊ ይሁንታ ተሰጥቷል።',
    'notif.report.snapshot.msg': 'የስራ አፈፃፀም ሪፖርት ተመዝግቧል።',
    'notif.report.review.msg': 'ሪፖርቱ በስራ አስፈፃሚ መገምገም አለበት።',
    'notif.report.approved.msg': 'ሪፖርቱ ሙሉ ይሁንታ አግኝቷል።',
    'notif.safeguarding.alert.msg': 'ሚስጥራዊ የደህንነት ጉዳይ አስቸኳይ ክትትል ይፈልጋል።',
    'notif.security.violation.msg': 'ያልተፈቀደ የመግባት ሙከራ ተገኝቶ ታግዷል።',
    'notif.ai.approval.msg': 'አውቶማቲክ ስራው የሰው ፈቃድ ይጠይቃል።',
    'notif.ai.halt.msg': 'ሁሉም የAI ስራዎች በአስቸኳይ ቆመዋል።',
  },
};

class ClientNotificationService {
  public localizeKey(
    key: string,
    lang: SupportedLanguageCode = 'en',
    params?: Record<string, string | number>
  ): string {
    const dict = CLIENT_NOTIFICATION_CATALOG[lang] || CLIENT_NOTIFICATION_CATALOG.en;
    let text = dict[key] || CLIENT_NOTIFICATION_CATALOG.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  public async getNotificationsForUser(
    options?: {
      role?: string;
      category?: string;
      unreadOnly?: boolean;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    notifications: ScopedInAppNotification[];
    unreadCount: number;
    error?: string;
  }> {
    if (typeof window === 'undefined') {
      return { success: true, notifications: [], unreadCount: 0 };
    }

    await sessionTokenStore.waitForPendingSync();
    const token = sessionTokenStore.getAuthToken();
    const roleLower = String(options?.role || sessionTokenStore.getActiveRole() || 'visitor').toLowerCase();
    if (!token || roleLower === 'visitor' || roleLower === 'public_visitor') {
      return { success: true, notifications: [], unreadCount: 0 };
    }

    try {
      const qs = new URLSearchParams();
      if (options?.category && options.category !== 'ALL') qs.set('category', options.category);
      if (options?.unreadOnly) qs.set('unreadOnly', 'true');
      if (options?.limit) qs.set('limit', String(options.limit));
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      const res = await authFetch(`/api/v1/operational/notifications${suffix}`);
      if (!res.ok) {
        return { success: false, notifications: [], unreadCount: 0 };
      }
      return await res.json();
    } catch {
      return { success: false, notifications: [], unreadCount: 0 };
    }
  }

  public async markNotificationRead(notificationId: string): Promise<{
    success: boolean;
    notification?: ScopedInAppNotification;
    error?: string;
  }> {
    await sessionTokenStore.waitForPendingSync();
    if (!sessionTokenStore.getAuthToken()) {
      return { success: false, error: 'Unauthorized: Sign in required.' };
    }
    const res = await authFetch(`/api/v1/operational/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'POST',
    });
    return await res.json();
  }

  public async archiveNotification(notificationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    await sessionTokenStore.waitForPendingSync();
    if (!sessionTokenStore.getAuthToken()) {
      return { success: false, error: 'Unauthorized: Sign in required.' };
    }
    const res = await authFetch(`/api/v1/operational/notifications/${encodeURIComponent(notificationId)}/archive`, {
      method: 'POST',
    });
    return await res.json();
  }

  public async getNotificationPreferences(): Promise<UserNotificationPreferences | null> {
    await sessionTokenStore.waitForPendingSync();
    if (!sessionTokenStore.getAuthToken()) return null;
    try {
      const res = await authFetch('/api/v1/operational/notification-preferences');
      if (!res.ok) return null;
      const body = await res.json();
      return body.preferences || null;
    } catch {
      return null;
    }
  }

  public async updateNotificationPreferences(
    updates: Partial<Omit<UserNotificationPreferences, 'id' | 'userId' | 'updatedAt'>>
  ): Promise<{ success: boolean; preferences?: UserNotificationPreferences; error?: string }> {
    await sessionTokenStore.waitForPendingSync();
    if (!sessionTokenStore.getAuthToken()) {
      return { success: false, error: 'Unauthorized: Sign in required.' };
    }
    const res = await authFetch('/api/v1/operational/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  }
}

export const clientNotificationService = new ClientNotificationService();
