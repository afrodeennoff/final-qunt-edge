export default {
  landing: {
    title: 'Votre journal de trading.',
    description:
      'Qunt Edge est un journal de trading web pour traders futures permettant de stocker, explorer et comprendre leur historique de trading.',
    cta: 'Commencer maintenant',
    updates: 'Dernières mises à jour du produit →',

    // New landing page sections (Precision Terminal design)
    nav: {
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      docs: 'Docs',
      blog: 'Blog',
      login: 'Connexion',
      startFree: 'Commencer Gratuitement',
    },

    hero: {
      badge: 'Logiciel de revue trading',
      headline: 'Auditez chaque décision de trade.',
      headlineAccent: '',
      subheadline:
        'Synchronisez vos trades, révisez votre comportement et transformez chaque session en plan plus clair.',
      ctaPrimary: 'Commencer gratuitement',
      ctaSecondary: 'Voir le walkthrough',
      noCreditCard: 'Pas de carte bancaire requise',
      firstAudit: 'Premier audit en quelques minutes',
    },

    trust: {
      title: 'Vos données sont en sécurité',
      soc2: 'Certifié SOC2',
      encryption: 'Chiffrement 256-bit',
      gdpr: 'Conforme RGPD',
      trustedBy: 'Approuvé par {count} traders',
      integrations: 'Intégrations',
    },

    // Extended features for new landing page
    featuresGrid: {
      headline: 'Tout ce dont vous avez besoin pour {highlight}',
      highlight: 'trader plus intelligemment',
      subheadline:
        "Analyses puissantes, insights IA et collaboration d'équipe sur une seule plateforme.",
      analytics: {
        title: 'Analyses Avancées',
        description:
          'Plongez dans vos performances avec analyse par déciles, heatmaps et métriques personnalisées.',
      },
      aiInsights: {
        title: 'Insights IA',
        description:
          "Reconnaissance de patterns et analyse comportementale alimentée par l'apprentissage automatique.",
      },
      teamSync: {
        title: "Sync d'Équipe",
        description: 'Partagez vos layouts, comparez vos performances et apprenez de vos pairs.',
      },
      multiBroker: {
        title: 'Import Multi-Broker',
        description:
          'Connectez Tradovate, Rithmic, IBKR, ou importez depuis CSV. Vos données, votre façon.',
      },
      exports: {
        title: 'Exports Prêts pour Coach',
        description:
          'Générez des briefs PDF et des rapports partageables pour vos sessions de mentorat.',
      },
      security: {
        title: 'Sécurité Entreprise',
        description: 'Chiffrement de niveau bancaire et conformité SOC2 protègent vos données.',
      },
    },

    pricingNew: {
      eyebrow: 'Tarifs',
      headline: 'Des plans simples pour une revue sérieuse.',
      highlight: 'tarification',
      subheadline:
        "Commencez avec le journal essentiel, puis ajoutez l'IA quand le workflow est prêt.",
      monthly: 'Mensuel',
      annual: 'Annuel',
      annualDiscount: '-20%',
      starter: {
        name: 'Starter',
        price: '0€',
        annualPrice: '0€',
        period: '/mois',
        description: 'Une base claire pour journaliser et revoir vos trades.',
        cta: 'Commencer',
        features: [
          'Journal manuel',
          'Widgets essentiels',
          'Revue de performance simple',
          'Upgrade quand nécessaire',
        ],
      },
      pro: {
        name: 'Pro',
        price: '49€',
        annualPrice: '39€',
        period: '/mois',
        description: "Débriefs IA, imports et analyses d'exécution plus profondes.",
        cta: 'Démarrer Pro',
        badge: 'Recommandé',
        features: [
          'Trades illimités',
          'Imports broker et CSV',
          'Débriefs IA de session',
          'Rapports prêts pour coach',
        ],
      },
      enterprise: {
        name: 'Desk',
        price: 'Sur mesure',
        annualPrice: 'Sur mesure',
        period: '',
        description: 'Workflows de revue partagés pour coachs, desks et équipes.',
        cta: 'Contacter le support',
        features: [
          'Tout de Pro',
          "Espaces d'équipe",
          'Contexte coaching partagé',
          'Configuration accompagnée',
        ],
      },
      annualNote: 'Facturé annuellement',
    },

    ctaNew: {
      headline: 'Prêt à {highlight} ?',
      highlight: 'trader plus intelligemment',
      subheadline:
        "Rejoignez {count} traders qui ont amélioré leurs performances avec Qunt Edge. Commencez votre audit gratuit aujourd'hui.",
      cta: 'Commencer un Audit Gratuit',
      noCreditCard: 'Pas de carte bancaire requise',
      setupTime: 'Configuration en 2 minutes',
    },

    home: {
      metadata: {
        title: 'Le meilleur journal de trading pour traders discrétionnaires | Qunt Edge',
        description:
          "Qunt Edge aide les traders sérieux à auditer la qualité d'exécution, suivre la dérive comportementale et améliorer leur constance grâce à des revues post-session structurées.",
      },
      hero: {
        capability1Title: "Audits d'Exécution",
        capability1Description: "Repérez la dérive de qualité avant qu'elle n'impacte votre PnL.",
        capability2Title: 'Débriefs IA',
        capability2Description: 'Transformez chaque session en feedback clair et actionnable.',
        capability3Title: "Coaching d'Équipe",
        capability3Description: 'Revoyez setups, process et risque avec votre desk.',
        integrationsTitle: 'Intégrations brokers de confiance',
        integration1: 'Tradovate',
        integration2: 'Rithmic',
        integration3: 'IBKR',
        integration4: 'CQG',
        integration5: 'NinjaTrader',
      },
      liveStats: {
        heading: 'Profondeur produit',
        title: 'Conçu pour une revue trading répétable.',
        description:
          "La plateforme couvre tout le workflow sans devenir trop lourde pour l'usage quotidien.",
        stat1Label: 'Widgets dashboard',
        stat2Label: "Chemins d'import",
        stat3Label: 'Outils IA',
        stat4Label: 'Workflows revue',
      },
      problem: {
        eyebrow: 'Le Problème',
        title: 'Les résultats disent si vous avez été payé,',
        accent: 'pas si vous étiez bon.',
        description:
          "Les traders moyens célèbrent les résultats. Les traders d'élite auditent les décisions. La différence entre une série chanceuse et un edge durable, c'est la discipline d'exécution — et la plupart des traders n'ont toujours aucun moyen de la mesurer.",
        mindsetEyebrow: 'Changement de Mentalité',
        mindsetDescription:
          "Faites du process une donnée de premier ordre. Quand la qualité d'exécution devient visible, l'amélioration cesse d'être vague et devient reproductible.",
        card1Title: 'Fausse Confiance',
        card1Description:
          "Un PnL positif avec un mauvais process, c'est de la chance, pas de la compétence. Sans audit d'exécution, les gains renforcent de mauvaises habitudes.",
        card2Title: 'Dérive Décisionnelle',
        card2Description:
          "De petits écarts de timing, de taille et de discipline s'additionnent silencieusement jusqu'à devenir des drawdowns irrécupérables.",
        card3Title: 'Aucune Boucle de Performance',
        card3Description:
          'Examiner les résultats sans auditer les décisions signifie que vous ne découvrez jamais la vraie cause de la sous-performance.',
      },
      workflow: {
        eyebrow: 'Comment Ça Marche',
        title: 'Une boucle simple pour une exécution plus propre.',
        description:
          'Connectez les données, révisez la session, puis transformez la dérive comportementale en action concrète.',
        signalTitle: 'Signal',
        signalDescription:
          'Chaque session devient visible sous forme de règles, de dérive et de conformité.',
        cadenceTitle: 'Cadence',
        cadenceDescription:
          'Le workflow reste assez léger pour être exécuté chaque jour, pas seulement après les drawdowns.',
        stage: 'Étape',
        step1Name: 'Connecter les données',
        step1Description:
          'Regroupez fills broker, historique de compte et notes dans une seule timeline.',
        step2Name: 'Revoir la session',
        step2Description:
          "Séparez l'exécution propre des entrées tardives, du risque excessif et des règles manquées.",
        step3Name: 'Agir sur la dérive',
        step3Description:
          'Convertissez la revue en règle, rapport ou action coaching pour la prochaine session.',
        step4Name: 'Détecter la Dérive',
        step4Description:
          "Signalez la dérive émotionnelle, de taille et de discipline avant qu'elle ne s'aggrave.",
        step5Name: 'Améliorer Chaque Semaine',
        step5Description:
          'Transformez les constats en interventions claires et mesurez la progression de conformité.',
      },
      features: {
        eyebrow: 'Fonctionnalités',
        title: 'Un workspace pour',
        highlight: "resserrer l'exécution",
        description:
          'Des modules simples pour synchroniser les trades, trouver les écarts de process et installer une habitude de revue.',
        listLabel: 'Fonctionnalités',
        issue1Badge: 'Données Fragmentées',
        issue1Title: 'Où sont vraiment vos trades ?',
        issue1Description:
          "Éparpillés entre brokers, feuilles de calcul et mémoire — jamais dans l'analyse.",
        issue1Solution: 'Analyses Avancées',
        issue2Badge: 'Erreurs Répétées',
        issue2Title: 'Pourquoi les mêmes erreurs, encore ?',
        issue2Description:
          "Sans revue structurée, aucune boucle d'amélioration n'existe. Les patterns restent invisibles.",
        issue2Solution: 'Insights IA',
        issue3Badge: "Isolement de l'Équipe",
        issue3Title: 'Votre coach voit-il ce que vous voyez ?',
        issue3Description:
          "Des données en silos rendent les écarts de performance invisibles jusqu'à ce qu'ils coûtent cher.",
        issue3Solution: "Sync d'Équipe",
        feature1Title: 'Sync trades',
        feature1Description:
          'Importez fills broker et historique CSV dans une seule timeline de performance.',
        feature2Title: "Analyse d'exécution",
        feature2Description:
          'Revoyez win rate, risque, timing, drawdown et qualité de setup sans bruit spreadsheet.',
        feature2Badge: 'Propulsé par IA',
        feature3Title: "Coaching d'équipe",
        feature3Description:
          'Partagez layouts, rapports et contexte de revue avec un coach ou un desk.',
        feature4Title: 'Revue comportementale',
        feature4Description:
          "Repérez tilt, revenge trading, règles cassées et dérive de qualité avant qu'ils ne s'accumulent.",
        feature5Title: 'Rapports exportables',
        feature5Description:
          'Générez des briefs propres pour mentorat, auto-revue et réunions de desk.',
        feature6Title: 'Débriefs IA',
        feature6Description:
          'Transformez une session brute en prochaines étapes concises ancrées dans les trades.',
      },
      demo: {
        eyebrow: 'Walkthrough produit',
        title: 'Voyez la boucle de revue en mouvement.',
        description:
          "Un passage rapide par l'import, le dashboard, les signaux comportementaux et les débriefs IA.",
        frameLabel: 'Aperçu workflow',
      },
      analysis: {
        eyebrow: 'Intelligence du Journal de Trading',
        title: 'Une revue en temps réel pour',
        accent: 'le process avant le résultat',
        description:
          "Les notes de journal, fills et données de compte sont analysés ensemble pour rendre la dérive comportementale visible avant qu'elle ne coûte cher.",
        streamLabel: "Flux d'Exécution",
        liveLabel: 'LIVE',
        planAdherence: 'Respect du Plan',
        riskDrift: 'Dérive de Risque',
        reviewSla: 'Délai de Revue',
        journalSignals: 'Signaux du Journal',
        anomalyProbability: "Probabilité d'Anomalie",
        log1: 'Analyse des exécutions récentes et des entrées du journal.',
        log2: 'Dérive de constance détectée après des pertes consécutives.',
        log3: 'Taille de position excessive signalée par rapport au baseline.',
        log4: 'Cooldown suggéré avec profil de taille réduit.',
        log5: 'Session stabilisée, conformité au plan restaurée.',
        chartPrice: 'Prix',
        chartEma: 'EMA',
        chartVolume: 'Volume',
      },
      preview: {
        ariaLabel: 'Aperçu interactif du dashboard de démonstration avec métriques illustratives',
        demo: 'Démo',
        live: 'Live',
        stat1Label: 'PnL total',
        stat2Label: 'Taux de réussite',
        stat3Label: 'Profit Factor',
        pnlChip: 'PnL',
        winRateChip: 'Taux de réussite',
        profitFactorChip: 'Profit Factor',
        recentTrades: 'Trades récents',
        long: 'Long',
        short: 'Short',
      },
      ai: {
        eyebrow: 'Propulsé par IA',
        title: "Une couche d'analyse privée qui étudie chaque trade comme une revue de desk.",
        description:
          "Qunt Edge utilise l'IA comme moteur de revue structuré, pas comme gadget. Chaque recommandation vise à renforcer la discipline, la boucle de feedback et la qualité des décisions hebdomadaires.",
        reasonTrailTitle: 'Piste de raisonnement',
        reasonTrailDescription:
          'Les recommandations restent explicables, vérifiables et faciles à challenger.',
        liveContextTitle: 'Contexte en direct',
        liveContextDescription:
          "Les signaux héritent de vos règles, de votre profil de risque et de vos patterns d'exécution au lieu de conseils génériques.",
        badge: 'IA explicable, pensée pour les traders',
        footerBadge: 'IA explicable',
        footerDescription:
          "Les décisions de l'IA restent ancrées à une piste de raisonnement transparente, afin que chaque intervention puisse être revue avec les preuves brutes du trade.",
        inspectSignal: 'Inspecter le signal',
        feature1Title: 'Débrief de Session IA',
        feature1Description:
          "Crée des récaps concis sur ce qui a fonctionné, ce qui a cassé et ce qu'il faut ajuster la session suivante.",
        feature2Title: 'Radar de Dérive Comportementale',
        feature2Description:
          "Signale les glissements subtils du comportement de risque et de la qualité des setups avant qu'ils ne deviennent coûteux.",
        feature3Title: 'Évaluation du Risque',
        feature3Description:
          'Évalue le sizing, la fréquence et la variance émotionnelle face à vos seuils personnels.',
        feature4Title: 'Insights & Briefs Intelligents',
        feature4Description:
          "Compile automatiquement rapports hebdomadaires, modèles de playbook et alertes d'intervention pour une revue structurée.",
        capabilityLabel: 'Capacité',
      },
      audience: {
        eyebrow: 'Pensé Pour Vous',
        title: 'Quel que soit votre style de trading,',
        highlight: 'nous vous couvrons',
        propBadge: 'Prop Firm',
        propTitle: 'Pour les Traders Prop Firm',
        propDescription:
          "Protégez votre compte financé et prouvez votre constance à votre firme d'évaluation.",
        propCta: 'Commencez à Protéger Votre Edge',
        propFeature1: 'Suivi des règles de challenge avec alertes de violation en direct',
        propFeature2: 'Suivi du drawdown journalier et maximal sur tous les comptes',
        propFeature3: 'Vérification des payouts avec rapports détaillés',
        propFeature4: "Audits de process d'équipe pour managers et mentors",
        propFeature5: 'Revue multi-comptes dans un espace de travail unifié',
        independentBadge: 'Indépendant',
        independentTitle: 'Pour les Traders Indépendants',
        independentDescription:
          'Construisez des routines répétables et éliminez la dérive émotionnelle de votre trading.',
        independentCta: 'Construisez Votre Edge',
        independentFeature1: 'Gestion multi-comptes sur plusieurs brokers et plateformes',
        independentFeature2: 'Synchronisation broker en direct avec Tradovate, Rithmic et MT5',
        independentFeature3: 'Insights comportementaux et détection de patterns par IA',
        independentFeature4: "Score de qualité d'exécution face à votre propre ruleset",
        independentFeature5: "Briefs hebdomadaires automatisés pour l'auto-revue structurée",
      },
      explorer: {
        badge: 'Explorateur Prop Firm',
        title: 'Comparez les firmes avec un premier passage plus propre.',
        description:
          'Filtrez par plateforme, structure de challenge et modèle de drawdown pour réduire le champ avant une recherche plus poussée.',
        searchPlaceholder: 'Rechercher par firme, plateforme ou modèle de payout...',
        tracked: 'Suivies',
        matching: 'Correspondantes',
        explorerBriefTitle: 'Résumé explorateur',
        explorerBriefHeading:
          'Présélectionnez les firmes avant de perdre du temps en analyse profonde.',
        explorerBriefDescription:
          'Commencez par la compatibilité plateforme, la structure du challenge et le modèle de drawdown, puis basculez vers le catalogue complet pour les détails de payout.',
        liveViewTitle: 'Vue en direct',
        liveViewCount: '{count} firmes dans la présélection actuelle',
        openFullCatalogue: 'Ouvrir le catalogue complet',
        needFullBoardTitle: 'Besoin du tableau complet ?',
        needFullBoardHeading: 'Ouvrez le catalogue complet des firmes.',
        needFullBoardDescription:
          'Passez à la vue catalogue dédiée pour les analyses de payout, les découpages temporels et le tableau complet des prop firms.',
        exploreAll: 'Explorer toutes les firmes',
        refineBoard: 'Affiner le tableau',
        reset: 'Réinitialiser',
        platformLabel: 'Plateforme',
        challengeLabel: 'Challenge',
        drawdownLabel: 'Drawdown',
        firmsInView: '{count} firmes affichées',
        firmsMatch: '{count} firmes sur {total} correspondent',
        noResultsTitle: 'Aucune firme ne correspond à ces filtres.',
        noResultsDescription:
          'Élargissez la plateforme ou le type de drawdown pour faire revenir plus de firmes dans le comparatif.',
        optionAll: 'Toutes',
        optionTradovate: 'Tradovate',
        optionRithmic: 'Rithmic',
        optionMetaTrader5: 'MetaTrader 5',
        optionCTrader: 'cTrader',
        optionDXtrade: 'DXtrade',
        optionOnePhase: 'Une phase',
        optionTwoPhase: 'Deux phases',
        optionInstant: 'Instant',
        optionStatic: 'Statique',
        optionTrailing: 'Trailing',
        optionEod: 'EOD',
        noLivePricing: 'Aucun tarif en direct',
        reviews: 'Avis',
        accountValue: 'Valeur du compte',
        paidOut: 'Payé',
        profitSplit: 'Part de profit',
        pricing: 'Tarification',
        pricingFrom: 'À partir de {price}',
        payoutSummary: 'Payouts {payoutModel} • règles {drawdownType}',
        liveAccounts: 'Comptes en direct',
        trackedAccounts: '{count} comptes suivis',
        viewFirm: 'Voir la firme',
      },
      social: {
        badge: 'Adopté par les Traders Sérieux',
        title:
          'La plateforme que les traders gardent quand ils arrêtent de traiter la revue comme une simple formalité.',
        description:
          "Le produit est construit autour de la discipline, de la clarté et de la revue décisionnelle répétable. C'est pourquoi traders financés, coachs et responsables de desk utilisent la même couche opératoire.",
        stat1Label: 'Traders',
        stat2Label: 'Comptes Financés',
        stat3Label: 'Couverture Instruments',
        stat4Label: 'Réponse Support Moyenne',
        onDeskFeedbackTitle: 'Feedback du desk',
        onDeskFeedbackDescription:
          'La qualité de revue ne compte que si traders et managers y reviennent. Ces citations reflètent un changement de routine, pas seulement un beau dashboard.',
        trustFoundationTitle: 'Fondation de confiance',
        trustFoundationDescription:
          "La plateforme est exigeante sur la sécurité, la propriété des données et la fiabilité opérationnelle, car un logiciel de revue de trading ne fonctionne que s'il mérite une confiance durable.",
        traderVoice: 'Voix du trader',
        testimonial1Quote:
          "Le rythme de revue a changé ma façon de trader. Je suis passé d'une chasse aux setups à une exécution répétable, et cela se voit dans les chiffres.",
        testimonial1Name: 'Trader Futures',
        testimonial1Role: 'Prop Firm financée',
        testimonial2Quote:
          "Notre équipe est passée d'hypothèses floues à des sessions de coaching pilotées par les données. Les briefs d'export nous font gagner des heures chaque semaine.",
        testimonial2Name: 'Desk Manager',
        testimonial2Role: 'Société de trading',
        testimonial3Quote:
          "Le brief hebdomadaire est l'outil le plus utile que je donne à mes étudiants. Il fait ressortir des patterns qu'ils ne voient littéralement pas seuls.",
        testimonial3Name: 'Coach Trading',
        testimonial3Role: 'Mentor',
        trust1Title: 'Sécurité dès la Conception',
        trust1Description:
          'Lectures et écritures limitées au compte avec vérifications de propriété sur chaque chemin de données.',
        trust2Title: 'Opérations Fiables',
        trust2Description:
          'Des garde-fous fail-closed et des routes durcies qui ne tombent jamais silencieusement en fallback.',
        trust3Title: 'Vos Données, Votre Contrôle',
        trust3Description:
          'Apportez votre workflow, exportez vos briefs et gardez vos données de performance portables.',
        trust4Title: 'Un Support Accessible',
        trust4Description:
          "Support produit, guidage in-app et chemins d'escalade directs pour les traders actifs.",
      },
      testimonials: {
        eyebrow: 'Retour des traders',
        title: 'La confiance des traders sérieux',
        description:
          'Conçu pour la revue disciplinée, l\'exécution reproductible et la cohérence à long terme.',
        testimonial1Quote:
          'Qunt Edge m\'a donné une boucle de revue plus claire. J\'ai arrêté de deviner et j\'ai commencé à m\'améliorer session par session.',
        testimonial1Name: 'Trader Futures',
        testimonial2Quote:
          'Le flux d\'import et de revue est assez rapide pour un usage quotidien, et assez strict pour une véritable responsabilité d\'équipe.',
        testimonial2Name: 'Responsable d\'équipe Prop',
        testimonial3Quote:
          'Le journal ressemble à un véritable espace de travail, pas à un tableau de bord marketing. Ça a changé ma constance.',
        testimonial3Name: 'Scalpeur discrétionnaire',
      },
      faq: {
        badge: 'FAQ',
        title: 'Des réponses claires pour les traders qui évaluent sérieusement la plateforme.',
        description:
          "Cette section retire rapidement l'incertitude : périmètre produit, brokers supportés, comportement IA, sécurité, tarification et usage en équipe.",
        bestForTitle: 'Idéal pour',
        bestForDescription:
          "Les traders futures discrétionnaires, les comptes financés, les coachs performance et les équipes qui veulent un seul système de revue plutôt que des notes dispersées et des captures d'écran.",
        commonQuestions: 'Questions fréquentes',
        answersLabel: '{count} réponses',
      },
      finalCta: {
        eyebrow: 'Commencez une revue propre',
        title: 'Construisez une boucle de trading plus claire.',
        titlePrefix: 'Prêt à',
        titleStrike: 'arrêter de deviner',
        titleBridge: 'et',
        titleHighlight: 'commencer à savoir',
        titleSuffix: '?',
        description:
          "Démarrez avec un compte, un rythme de revue et une cible d'amélioration claire.",
        primary: 'Commencer gratuitement',
        secondary: 'Parcourir les Prop Firms',
        footnote:
          'Pas de carte bancaire requise · Configuration en 2 minutes · Résiliation à tout moment',
      },
    },

    footerNew: {
      tagline:
        "Le journal de trading et la plateforme d'analyse pour les traders discrétionnaires qui prennent leur métier au sérieux.",
      product: 'Produit',
      resources: 'Ressources',
      company: 'Entreprise',
      support: 'Support',
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      integrations: 'Intégrations',
      changelog: 'Journal des modifications',
      documentation: 'Documentation',
      apiReference: 'Référence API',
      blog: 'Blog',
      community: 'Communauté',
      about: 'À propos',
      careers: 'Carrières',
      contact: 'Contact',
      legal: 'Légal',
      faq: 'FAQ',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      disclaimers: 'Avertissements',
      contactSupport: 'Contacter le support',
      startAudit: 'Commencer un audit gratuit',
      brandLabel: 'Trading Intelligence',
      copyright: '© 2026 Qunt Edge. Tous droits réservés.',
    },
    partners: {
      title: 'Nos Partenaires',
      description:
        'Nous collaborons avec les leaders du secteur pour vous offrir la meilleure expérience de trading.',
    },
    openSource: {
      title: 'Open Source',
      description:
        "Qunt Edge s'engage envers la communauté open source. Explorez nos projets, contribuez au code ou même clonez le dépôt.",
    },
    features: {
      heading: 'Fonctionnalités',
      subheading: 'Les bons outils pour vous aider à améliorer votre trading.',
      'data-import': {
        title: 'Importation de données',
        description:
          "Notre plateforme offre une synchronisation automatique avec Rithmic et Tradovate, ainsi que des intégrations avec des copiers comme ETP et Thor. Grâce à notre système unique de mapping intelligent, vous pouvez importer n'importe quel fichier CSV, quelle que soit sa structure.",
        stat: 'Intégrations multiples et synchronisation',
      },
      'performance-visualization': {
        title: 'Visualisation des performances',
        description:
          'Visualisez vos performances de trading avec des graphiques et des diagrammes interactifs. Analysez les tendances, identifiez vos points forts et repérez les domaines à améliorer.',
        stat: 'Analyses complètes',
      },
      'daily-performance': {
        title: 'Performance quotidienne',
        description:
          'Suivez vos résultats de trading quotidiens avec une vue calendrier intuitive. Identifiez rapidement les tendances et les modèles dans vos performances de trading.',
        stat: 'Vue calendrier',
      },
      'ai-journaling': {
        title: 'Journal assisté par IA',
        description:
          'Améliorez vos émotions de trading grâce à un journal assisté par IA. Nos algorithmes avancés analysent vos entrées pour identifier les modèles émotionnels et les biais.',
        stat: 'Intelligence émotionnelle',
      },
      'chat-feature': {
        title: 'Coach de Trading IA',
        description:
          'Obtenez des insights et analyses personnalisés de notre coach IA. Comprenez vos patterns de trading, identifiez vos forces et faiblesses, et recevez des recommandations actionnables.',
        stat: 'Analyse en Temps Réel',
        conversation: {
          analyze:
            'Analysez ma performance de trading du mois dernier et identifiez les facteurs clés affectant mon P&L',
          patterns:
            "Quels patterns psychologiques observez-vous dans mes trades perdants ? Y a-t-il des conditions de marché spécifiques où j'ai systématiquement des difficultés ?",
          riskManagement:
            'Comment puis-je améliorer ma gestion des risques ? Mon drawdown maximum semble trop élevé pour la taille de mon compte',
          profitableSetup:
            'Quelle est ma configuration la plus rentable et dans quelles conditions de marché fonctionne-t-elle le mieux ?',
          journalInsights:
            'Basé sur mes entrées de journal de trading, quels états émotionnels corrèlent avec mes meilleurs et pires jours de trading ?',
          marketTiming:
            "Analysez mon timing d'entrée et de sortie - est-ce que j'entre trop tôt ou trop tard par rapport aux niveaux clés ?",
          positionSizing:
            'Ma taille de position est-elle optimale pour mon taux de réussite et mes ratios risque-récompense selon les différentes configurations ?',
        },
        responses: {
          analyze:
            "J'ai analysé vos 127 trades du mois dernier. Votre performance globale montre une exécution technique solide mais une interférence émotionnelle significative pendant les périodes de drawdown.",
          patterns:
            'Vos entrées de journal révèlent un pattern clair : après 2+ pertes consécutives, vous augmentez la taille de position de 40% et abandonnez vos critères de configuration. Ce trading de revanche représente 73% de vos plus grandes pertes.',
          riskManagement:
            "Votre drawdown maximum de 12% dépasse les niveaux optimaux pour votre taille de compte. Je recommande d'implémenter une réduction de taille de position après les pertes et d'utiliser la règle des 2% de manière cohérente.",
          profitableSetup:
            "Votre stratégie de breakout matinal montre des résultats exceptionnels avec 82% de taux de réussite pendant 9h30-10h30 EST lorsqu'elle est combinée avec une confirmation de volume supérieure à 1.5x la moyenne.",
          journalInsights:
            'Forte corrélation entre la qualité du sommeil et les performances - vos trades de mardi-mercredi montrent 23% de P&L plus élevé quand vous mentionnez "bien reposé" dans vos entrées de journal.',
          marketTiming:
            "L'analyse montre que vous entrez 15-30 minutes trop tôt sur les breakouts. Attendre la confirmation améliorerait votre taux de réussite de 68% à environ 78%.",
          positionSizing:
            "Votre sizing actuel est à 87% de l'optimal Kelly. Considérez augmenter la taille sur vos configurations à plus haute probabilité tout en maintenant une approche conservatrice sur les trades expérimentaux.",
        },
        analysis: {
          winRate: {
            metric: 'Taux de Réussite Global',
            value: '68%',
            trend: 'positive',
            insight:
              'Au-dessus de la moyenne mais risque de concentration sur les trades de breakout (45% du volume) nécessite diversification',
          },
          revengeTrading: {
            metric: 'Taux de Perte du Trading de Revanche',
            value: '73%',
            trend: 'negative',
            insight:
              'Fuite majeure de profits : trades de revanche après 2+ pertes montrent 73% de taux de perte vs 32% normal',
          },
          fomo: {
            metric: 'Analyse des Trades FOMO',
            value: '12 occurrences',
            trend: 'negative',
            insight:
              'Entrées FOMO typiquement 15-30 minutes après breakout initial montrent 83% de taux de perte',
          },
          bestSetup: {
            metric: 'Performance Configuration Optimale',
            value: '82% taux de réussite',
            trend: 'positive',
            insight:
              'Breakouts matinaux (9h30-10h30 EST) avec confirmation de volume montrent le plus haut succès',
          },
          bestDays: {
            metric: 'Performance par Jour',
            value: 'Pic Mar-Mer',
            trend: 'neutral',
            insight:
              'Mardi-Mercredi montrent 23% de P&L moyen plus élevé, probablement dû à un horaire de sommeil cohérent',
          },
          riskReward: {
            metric: 'Optimisation Risque-Récompense',
            value: '1:1.8 moyenne',
            trend: 'positive',
            insight:
              'Actuel R:R de 1:1.8 est optimal pour votre taux de réussite de 68%, mais pourrait améliorer placement des stops',
          },
          emotionalState: {
            metric: 'Corrélation Trading Émotionnel',
            value: '34% variance',
            trend: 'negative',
            insight:
              'Entrées de journal mentionnant "stress" ou "pressé" corrèlent avec 34% de performance inférieure',
          },
          marketConditions: {
            metric: 'Adaptation au Marché',
            value: 'Tendance: 78% TR',
            trend: 'positive',
            insight:
              'Performance forte les jours de tendance mais difficultés en conditions hachées (45% TR)',
          },
          executionQuality: {
            metric: 'Analyse Exécution des Trades',
            value: '12.3% impact slippage',
            trend: 'negative',
            insight:
              'Moyenne de 2.3 ticks de slippage sur entrées suggère amélioration du timing des ordres au marché',
          },
          positionSizing: {
            metric: 'Efficacité Taille de Position',
            value: '87% Kelly optimal',
            trend: 'positive',
            insight:
              'Taille de position est 87% de Kelly optimal - légèrement conservateur mais approprié pour tolérance au risque',
          },
          trends: {
            positive: 'FORCE',
            negative: 'FAIBLESSE',
            neutral: 'INSIGHT',
            warning: 'ATTENTION',
          },
        },
      },
    },
    accordion: {
      community: {
        title: 'Communauté',
        description:
          "Rejoignez une communauté de traders passionnés par le trading algorithmique et l'analyse financière.",
        button: 'Rejoindre la communauté Discord',
      },
      openRoadmap: {
        title: 'Feuille de route ouverte',
        description:
          'Une fonctionnalité vous manque ? Lancez une discussion, signalez un problème, contribuez au code ou même clonez le dépôt.',
        button: 'Voir les mises à jour',
      },
      security: {
        title: 'Sécurité',
        description:
          'Nous prenons la sécurité au sérieux. Découvrez nos mesures de sécurité et comment signaler des vulnérabilités.',
      },
      openSource: {
        title: 'Open Source',
        description:
          "Explorez le dépôt {repoName} et contribuez à l'avenir de l'analyse de trading.",
        button: 'Voir le dépôt',
      },
      lastUpdated: 'Dernière mise à jour {time}',
    },
    navbar: {
      features: 'Fonctionnalités',
      propFirms: 'Catalogue Prop Firms',
      propFirmPerk: 'Deals',
      dataImport: 'Import de données',
      performanceVisualization: 'Visualisation des performances',
      dailyPerformance: 'Performance quotidienne',
      aiJournaling: 'Journal assisté par IA',
      developers: 'Développeurs',
      openSource: 'Open Source',
      documentation: 'Documentation',
      joinCommunity: 'Rejoindre la communauté',
      api: 'API',
      pricing: 'Tarifs',
      updates: 'Mises à jour',
      logo: {
        title: 'Navigation',
        dashboard: 'Tableau de bord',
        home: 'Site web',
      },
      productUpdates: 'Mises à jour du produit',
      productUpdatesDescription:
        'Restez informé de nos dernières fonctionnalités et améliorations.',
      community: 'Communauté',
      communityDescription:
        'Partagez vos idées, signalez des bugs et discutez des fonctionnalités.',
      dashboard: 'Tableau de bord',
      signIn: 'Se connecter',
      elevateTrading:
        "Améliorez votre trading avec des analyses complètes et des insights alimentés par l'IA.",
      dataImportDescription: 'Importez des données depuis différents fournisseurs.',
      performanceVisualizationDescription: 'Visualisez vos performances de trading.',
      dailyPerformanceDescription:
        'Suivez vos résultats quotidiens avec une vue calendrier intuitive.',
      aiJournalingDescription:
        "Améliorez vos émotions de trading avec un journal assisté par l'IA.",
      openSourceDescription: 'Explorez nos projets open-source et contribuez.',
      youtubeDescription: 'Regardez des tutoriels et des analyses de trading.',
      documentationDescription: 'Guides complets et références API.',
      joinCommunityDescription: "Connectez-vous avec d'autres développeurs et traders.",
      apiDescription: 'Accédez à notre API pour des intégrations personnalisées.',
      oneApi: 'Une API pour les gouverner toutes',
      oneApiDescription:
        'Une seule API se connectant sans effort à plusieurs fournisseurs et obtenant un format unifié.',
      toggleTheme: 'Changer de thème',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      mobileMenu: 'Menu mobile',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
      systemTheme: 'Thème système',
      changeTheme: 'Changer de thème',
      changeLanguage: 'Changer de langue',
      timezone: 'Fuseau horaire',
      teams: 'Équipes',
      support: 'Support',
      leaderboard: 'Classement',
      about: 'À propos',
      faq: 'FAQ',
    },
    propfirms: {
      title: 'Catalogue des Prop Firms',
      description:
        'Explorez les prop firms suivies par les utilisateurs de Qunt Edge. Consultez les statistiques réelles sur les comptes enregistrés et les performances de payouts.',
      registeredAccounts: 'Comptes enregistrés',
      accountTemplates: 'Modèles de comptes',
      chart: {
        title: 'Comptes enregistrés par Prop Firm',
        accounts: 'Comptes',
      },
      sort: {
        label: 'Trier par',
        accounts: 'Nombre de Comptes',
        paidPayout: 'Montant des payouts payés',
        refusedPayout: 'Montant des payouts refusés',
      },
      timeframe: {
        label: 'Période',
        currentMonth: 'Mois en cours',
        last3Months: '3 Derniers Mois',
        last6Months: '6 Derniers Mois',
        '2024': '2024',
        '2025': '2025',
        '2026': '2026',
        allTime: 'Tout le temps',
      },
      payouts: {
        title: 'Statistiques de payouts',
        paid: {
          label: 'Payés',
          description: 'Montant total et nombre de payouts payés et validés',
        },
        pending: {
          label: 'En Attente',
          description: 'Montant total et nombre de payouts en attente',
        },
        refused: {
          label: 'Refusés',
          description: 'Montant total et nombre de payouts refusés',
        },
        amount: 'Montant',
        'count#zero': 'Aucun payout',
        'count#one': '1 payout',
        'count#other': '{count} payouts',
      },
      other: {
        title: 'Autres Prop Firms',
        description:
          'Prop firms avec des comptes enregistrés mais non présentes dans notre catalogue de modèles',
      },
      noStats: 'Aucune statistique disponible',
    },
  },
} as const
