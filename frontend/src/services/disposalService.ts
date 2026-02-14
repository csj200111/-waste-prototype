import type {
  DisposalApplication,
  DisposalItem,
  PaymentMethod,
} from '@/types/disposal';
import sampleApplications from '@/lib/mock-data/sample-applications.json';

const applications = [...(sampleApplications as DisposalApplication[])];

let idCounter = applications.length + 1;

function generateApplicationNumber(regionId: string): string {
  const prefix = regionId.toUpperCase().replace('R', 'GN');
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const seq = String(idCounter).padStart(5, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

export const disposalService = {
  createApplication(data: {
    userId: string;
    regionId: string;
    items: DisposalItem[];
    disposalAddress: string;
    preferredDate: string;
    totalFee: number;
  }): DisposalApplication {
    const id = `a${idCounter++}`;
    const now = new Date().toISOString();

    const application: DisposalApplication = {
      id,
      applicationNumber: generateApplicationNumber(data.regionId),
      userId: data.userId,
      regionId: data.regionId,
      items: data.items,
      disposalAddress: data.disposalAddress,
      preferredDate: data.preferredDate,
      totalFee: data.totalFee,
      status: 'pending_payment',
      paymentMethod: null,
      createdAt: now,
      updatedAt: now,
    };

    applications.push(application);
    return application;
  },

  getApplication(id: string): DisposalApplication | undefined {
    return applications.find((a) => a.id === id);
  },

  getMyApplications(): DisposalApplication[] {
    return [...applications];
  },

  cancelApplication(id: string): DisposalApplication | undefined {
    const app = applications.find((a) => a.id === id);
    if (!app) return undefined;

    app.status = 'cancelled';
    app.updatedAt = new Date().toISOString();
    return { ...app };
  },

  processPayment(
    id: string,
    method: PaymentMethod,
  ): DisposalApplication | undefined {
    const app = applications.find((a) => a.id === id);
    if (!app) return undefined;

    app.status = 'paid';
    app.paymentMethod = method;
    app.updatedAt = new Date().toISOString();
    return { ...app };
  },
};
