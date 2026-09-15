import { ThresholdTable } from "@/components/ThresholdTable";

export default function ReferencesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[26px] font-bold tracking-tight">Références et seuils publiés</h1>
      <p className="text-[14px] text-muted max-w-3xl leading-relaxed">
        Registre des études qui ont proposé des seuils d&apos;index hépato-rénal pour la stéatose hépatique, avec l&apos;appareil, la méthode de référence et la population de chacune.
        Ce registre est purement documentaire : l&apos;application n&apos;applique aucun de ces seuils à vos mesures. Les seuils varient de 0,985 à 2,20 selon les études ;
        aucune société savante ne recommande l&apos;index hépato-rénal comme mesure quantitative de la graisse hépatique (WFUMB 2024, EASL-EASD-EASO 2024, AASLD 2025).
      </p>
      <ThresholdTable machine={null} full />
      <h2 className="text-[18px] font-semibold mt-4">Revues et méta-analyses</h2>
      <ul className="text-[14px] list-disc pl-5 flex flex-col gap-1 max-w-3xl">
        <li>Wang JL et al. Reliability of ultrasonic hepatorenal indices in assessing hepatic steatosis: a systematic review and meta-analysis. J Clin Ultrasound 2026. <a className="text-accent underline" href="https://doi.org/10.1002/jcu.70006" target="_blank" rel="noreferrer noopener">doi:10.1002/jcu.70006</a></li>
        <li>Sutanto R et al. Diagnostic test accuracy of hepatorenal index in pediatric MASLD: systematic review and meta-analysis. Diagnostics 2026;16(5):729. <a className="text-accent underline" href="https://doi.org/10.3390/diagnostics16050729" target="_blank" rel="noreferrer noopener">doi:10.3390/diagnostics16050729</a></li>
        <li>Duncan K, Vealé BL. Revisiting the hepatorenal index in the quantification of hepatic steatosis. Ultrasound Q 2024;40(3). <a className="text-accent underline" href="https://doi.org/10.1097/RUQ.0000000000000681" target="_blank" rel="noreferrer noopener">doi:10.1097/RUQ.0000000000000681</a></li>
        <li>Ferraioli G et al. WFUMB Guidelines/Guidance on Liver Multiparametric Ultrasound. Part 2: Liver Fat Quantification. Ultrasound Med Biol 2024;50(8):1088-98. <a className="text-accent underline" href="https://doi.org/10.1016/j.ultrasmedbio.2024.03.014" target="_blank" rel="noreferrer noopener">doi:10.1016/j.ultrasmedbio.2024.03.014</a></li>
        <li>Vara G et al. Texture analysis on ultrasound: the effect of time gain compensation. J Med Phys 2020;45(4):41-8. <a className="text-accent underline" href="https://doi.org/10.4103/jmp.JMP_82_20" target="_blank" rel="noreferrer noopener">doi:10.4103/jmp.JMP_82_20</a></li>
        <li>Gao J et al. The effect of backscatter anisotropy in assessing hepatic steatosis using ultrasound hepatorenal index. J Ultrasound Med 2025. <a className="text-accent underline" href="https://doi.org/10.1002/jum.16669" target="_blank" rel="noreferrer noopener">doi:10.1002/jum.16669</a></li>
        <li>Cha DI et al. Deep learning-based automated quantification of the hepatorenal index. Ultrasonography 2021;40(4):565-74. <a className="text-accent underline" href="https://doi.org/10.14366/usg.20179" target="_blank" rel="noreferrer noopener">doi:10.14366/usg.20179</a></li>
      </ul>
    </div>
  );
}
